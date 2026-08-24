import type { HomeSectionData } from "@/lib/public/home-data";
import { HeroSection } from "@/components/public/sections/hero-section";
import { LatestReleasesSection } from "@/components/public/sections/latest-releases-section";
import { FeaturedEpisodeSection } from "@/components/public/sections/featured-episode-section";
import { RecentEpisodesSection } from "@/components/public/sections/recent-episodes-section";
import { TextBlockSection } from "@/components/public/sections/text-block-section";
import { HostsSection } from "@/components/public/sections/hosts-section";
import { EditorialsSection } from "@/components/public/sections/editorials-section";
import { EventsSection } from "@/components/public/sections/events-section";
import { PlatformsSection } from "@/components/public/sections/platforms-section";

export function renderHomeSection(section: HomeSectionData) {
  switch (section.key) {
    case "HERO":
      return <HeroSection content={section.content} />;
    case "LATEST_RELEASES":
      return <LatestReleasesSection />;
    case "FEATURED_EPISODE":
      return <FeaturedEpisodeSection content={section.content} />;
    case "RECENT_EPISODES":
      return <RecentEpisodesSection content={section.content} />;
    case "MANIFESTO":
      return <TextBlockSection content={section.content} />;
    case "ABOUT":
      return <TextBlockSection content={section.content} variant="highlight" />;
    case "HOSTS":
      return <HostsSection content={section.content} />;
    case "EDITORIALS":
      return <EditorialsSection content={section.content} />;
    case "EVENTS":
      return <EventsSection content={section.content} />;
    case "AUDIENCE_QUESTION":
      return <TextBlockSection content={section.content} variant="highlight" />;
    case "PLATFORMS":
      return <PlatformsSection content={section.content} />;
    case "FINAL_CTA":
      return <TextBlockSection content={section.content} />;
    default:
      return null;
  }
}
