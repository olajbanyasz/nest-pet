import { Button } from 'primereact/button';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  getRadioMetadata,
  getRadioStations,
  getRadioStreamUrl,
  RadioStation,
} from '../../api/streamApi';
import VolumeControl from './VolumeControl';

const VOLUME_STORAGE_KEY = 'netradio_widget_volume';
const STATION_STORAGE_KEY = 'netradio_widget_station_id';
const VOLUME_STEP = 5;

const NetRadioWidget: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [streamTitle, setStreamTitle] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(() => {
    const stored = window.localStorage.getItem(VOLUME_STORAGE_KEY);
    const parsed = stored ? Number(stored) : Number.NaN;
    if (!Number.isFinite(parsed)) {
      return 80;
    }

    return Math.min(100, Math.max(0, parsed));
  });

  const selectedStation = useMemo(
    () => stations.find((station) => station.id === selectedStationId),
    [stations, selectedStationId],
  );

  useEffect(() => {
    const loadStations = async () => {
      setIsLoading(true);
      try {
        const response = await getRadioStations();
        setStations(response);
        if (response.length > 0) {
          const savedStationId =
            window.localStorage.getItem(STATION_STORAGE_KEY);
          const savedStationExists = response.some(
            (station) => station.id === savedStationId,
          );
          setSelectedStationId(
            savedStationExists && savedStationId
              ? savedStationId
              : response[0].id,
          );
        }
        setErrorMessage('');
      } catch {
        setErrorMessage('Failed to load radio stations.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadStations();
  }, []);

  useEffect(() => {
    if (!selectedStationId) {
      return;
    }

    window.localStorage.setItem(STATION_STORAGE_KEY, selectedStationId);
  }, [selectedStationId]);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.volume = volume / 100;
    window.localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
  }, [volume]);

  const playSelectedStation = async () => {
    const audio = audioRef.current;
    if (!audio || !selectedStation) {
      return;
    }

    try {
      audio.pause();
      audio.src = getRadioStreamUrl(selectedStation.id);
      audio.load();
      await audio.play();
      setIsPlaying(true);
      setErrorMessage('');
    } catch {
      setIsPlaying(false);
      setErrorMessage('Unable to start radio stream.');
    }
  };

  const pausePlayback = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.pause();
    setIsPlaying(false);
  };

  const onStationChange = (event: DropdownChangeEvent) => {
    const nextStationId = event.value as string;
    setSelectedStationId(nextStationId);
    setStreamTitle(null);

    if (isPlaying && audioRef.current) {
      const switchStation = async () => {
        try {
          const audio = audioRef.current;
          if (!audio) {
            return;
          }
          audio.pause();
          audio.src = getRadioStreamUrl(nextStationId);
          audio.load();
          await audio.play();
          setErrorMessage('');
        } catch {
          setIsPlaying(false);
          setErrorMessage('This station is not supported in your browser.');
        }
      };

      void switchStation();
    }
  };

  const loadMetadata = useCallback(async (stationId: string) => {
    try {
      const metadata = await getRadioMetadata(stationId);
      setStreamTitle(metadata.streamTitle);
    } catch {
      setStreamTitle(null);
    }
  }, []);

  useEffect(() => {
    if (!isPlaying || !selectedStationId) {
      return;
    }

    void loadMetadata(selectedStationId);

    const intervalId = window.setInterval(() => {
      void loadMetadata(selectedStationId);
    }, 20000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPlaying, selectedStationId, loadMetadata]);

  const changeVolume = (delta: number) => {
    setVolume((previous) => {
      const next = previous + delta;
      return Math.min(100, Math.max(0, next));
    });
  };

  return (
    <section
      style={{
        width: '100%',
        maxWidth: 640,
        margin: '0 auto 20px',
        border: '2px solid rgb(221, 221, 221)',
        borderRadius: 8,
        padding: 16,
        textAlign: 'center',
      }}
    >
      <h2 style={{ margin: '0 0 12px' }}>Netradio</h2>
      {isLoading ? (
        <p>Loading stations...</p>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <VolumeControl
              volume={volume}
              onIncrease={() => changeVolume(VOLUME_STEP)}
              onDecrease={() => changeVolume(-VOLUME_STEP)}
            />
            <Dropdown
              inputId="radio-station-select"
              value={selectedStationId}
              options={stations}
              optionLabel="name"
              optionValue="id"
              onChange={onStationChange}
              placeholder="Select station"
              pt={{
                input: {
                  style: {
                    paddingTop: 0,
                    paddingBottom: 0,
                    lineHeight: '22px',
                  },
                },
                item: {
                  style: {
                    padding: '4px 8px',
                    fontSize: '12px',
                  },
                },
              }}
              style={{ minWidth: 240, height: 24 }}
            />
            {isPlaying ? (
              <Button
                icon="pi pi-pause"
                rounded
                outlined
                severity="danger"
                aria-label="Pause"
                onClick={pausePlayback}
                size="small"
                style={{ width: 20, height: 20, paddingRight: 9 }}
              />
            ) : (
              <Button
                icon="pi pi-play"
                rounded
                outlined
                severity="success"
                aria-label="Play"
                onClick={() => void playSelectedStation()}
                size="small"
                style={{ width: 20, height: 20, paddingRight: 7 }}
              />
            )}
          </div>
        </>
      )}
      {errorMessage && (
        <p style={{ color: '#b42318', marginTop: 12 }}>{errorMessage}</p>
      )}
      <p style={{ margin: '10px 0 0', minHeight: 20 }}>
        {streamTitle ? `${streamTitle}` : '-:-'}
      </p>
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setErrorMessage('This station is not supported in your browser.');
        }}
      />
    </section>
  );
};

export default NetRadioWidget;
