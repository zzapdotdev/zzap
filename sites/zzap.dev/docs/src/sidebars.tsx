export const sidebars: SidebarType = [
  {
    name: "Intro",
    startsWith: "/docs",
    items: [
      {
        title: "What is zzap",
        href: "/docs",
      },
      {
        title: "Installation",
        href: "/docs/installation",
      },
      {
        title: "Quick Start",
        href: "/docs/quick-start",
      },
    ],
  },

  {
    name: "Plugins",
    startsWith: "/docs",
    items: [
      {
        title: "What is a Plugin",
        href: "/docs/plugins",
      },
      {
        title: "Official Plugins",
        href: "/docs/plugins/official-plugins",
      },
      {
        title: "Creating a Plugin",
        href: "/docs/plugins/creating-a-plugin",
      },
    ],
  },

  {
    name: "Guides",
    startsWith: "/guides",
    items: [],
  },
];

type SidebarType = Array<{
  name: string;
  startsWith: string;
  items: SidebarItemType[];
}>;

type SidebarItemType = {
  title: string;
  href: string;
};
