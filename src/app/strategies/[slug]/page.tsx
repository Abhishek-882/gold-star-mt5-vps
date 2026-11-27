import { redirect } from 'next/navigation';

export default function StrategyRedirectPage({
  params,
}: {
  params: { slug: string };
}) {
  if (!params.slug || params.slug === 'gold-star') {
    redirect('/terminal');
  }
  redirect(`/terminal?strategy=${encodeURIComponent(params.slug)}`);
}
