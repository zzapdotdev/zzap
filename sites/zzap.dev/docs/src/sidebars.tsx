export const sidebars: SidebarType = [
  {
    name: "Docs",
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
