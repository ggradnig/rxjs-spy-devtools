import { StackFrame } from 'stacktrace-js';

export interface Graph {
  destination: number | null;
  merges: number[];
  rootDestination: number | null;
  sources: number[];
}

export interface Notification {
  error?: any;
  graph: Graph | null;
  id: number;
  notification: string;
  source: string;
  stackTrace: StackFrame[] | null;
  tag: string | null;
  type: string;
  value?: any;
}