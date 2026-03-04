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

const NetRadioWidget: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [streamTitle, setStreamTitle] = useState<string | null>(null);

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
          setSelectedStationId(response[0].id);
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

  const playSelectedStation = async () => {
    const audio = audioRef.current;
    if (!audio || !selectedStation) {
      return;
    }

    try {
      audio.src = getRadioStreamUrl(selectedStation.id);
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
      audioRef.current.src = getRadioStreamUrl(nextStationId);
      void audioRef.current.play();
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
      />
    </section>
  );
};

export default NetRadioWidget;
