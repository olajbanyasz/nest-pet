type ArgType = {
  action?: string;
  control?: string | { type: string };
  description?: string;
  options?: string[];
  table?: Record<string, unknown>;
};

type Args = Record<string, unknown>;

type ComponentAnnotations<TComponent> = {
  title?: string;
  component?: TComponent;
  tags?: string[];

  args?: TComponent extends import('react').ComponentType<infer P>
    ? Partial<P>
    : Args;
  argTypes?: Record<string, ArgType>;
  parameters?: Record<string, unknown>;
  decorators?: Array<(Story: import('react').ComponentType) => JSX.Element>;
};

type StoryAnnotations<TComponent> = {
  args?: TComponent extends import('react').ComponentType<infer P>
    ? Partial<P>
    : Args;
  render?: (args: Args) => JSX.Element;
  argTypes?: Record<string, ArgType>;
  parameters?: Record<string, unknown>;
  name?: string;
  tags?: string[];
};

declare module '@storybook/react-webpack5' {
  export type Meta<TComponent = unknown> = ComponentAnnotations<TComponent>;
  export type StoryObj<TComponent = unknown> = StoryAnnotations<TComponent>;
  export type Preview = {
    parameters?: Record<string, unknown>;
    decorators?: Array<(Story: import('react').ComponentType) => JSX.Element>;
  };
  export interface StorybookConfig {
    stories: string[];
    addons?: string[];
    framework?: string | { name: string; options?: Record<string, unknown> };
    staticDirs?: string[];
  }
}
