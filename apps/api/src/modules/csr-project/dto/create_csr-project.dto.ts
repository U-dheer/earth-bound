export class CreateCsrDto {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: [number, number] | null;
  organizer_id: string;
}
