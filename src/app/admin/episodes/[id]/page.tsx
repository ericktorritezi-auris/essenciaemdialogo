import { EpisodeEditor } from "../episode-editor";

export default function EditEpisodePage({ params }: { params: { id: string } }) {
  return <EpisodeEditor episodeId={params.id} />;
}
