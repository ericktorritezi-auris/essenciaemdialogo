import { NewsEditor } from "../news-editor";

export default function EditNewsPage({ params }: { params: { id: string } }) {
  return <NewsEditor newsId={params.id} />;
}
