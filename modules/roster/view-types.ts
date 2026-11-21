import type {
  EngineBrand,
  EngineProcess,
  GenerationResult,
} from "@/modules/roster/engine";

export interface RosterMeta {
  id: string;
  month: number;
  year: number;
  status: "DRAFT" | "ISSUES_FOUND" | "PUBLISHED";
  generatedAt: string;
  publishedAt: string | null;
}

export interface RosterEmployeeOption {
  id: string;
  code: string;
  name: string;
  podId: string | null;
}

export interface RosterPodOption {
  id: string;
  name: string;
  leadId: string | null;
}

export interface RosterViewData {
  meta: RosterMeta | null;
  result: GenerationResult;
  employees: RosterEmployeeOption[];
  pods: RosterPodOption[];
  brands: EngineBrand[];
  processes: EngineProcess[];
}
