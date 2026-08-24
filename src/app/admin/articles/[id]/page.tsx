import { ArticleEditor } from "../article-editor";

export default function EditArticlePage({ params }: { params: { id: string } }) {
  return <ArticleEditor articleId={params.id} />;
}
