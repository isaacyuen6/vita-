export type MuscleRegion = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export type Exercise = {
  equipment: string;
  form: string[];
  id: string;
  name: string;
  primary: string[];
  regions: MuscleRegion[];
  secondary: string[];
  target: string;
};
