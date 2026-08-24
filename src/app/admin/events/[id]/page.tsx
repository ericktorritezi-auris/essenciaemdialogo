import { EventEditor } from "../event-editor";

export default function EditEventPage({ params }: { params: { id: string } }) {
  return <EventEditor eventId={params.id} />;
}
