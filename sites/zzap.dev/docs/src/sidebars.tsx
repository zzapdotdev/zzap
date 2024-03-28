export const sidebars: SidebarType = [
  {
    name: "Intro",
    path: "/docs",
    chapters: [{ name: "Intro", path: "/docs/intro" }],
  },
  {
    name: "Plugins",
    path: "/docs",
    chapters: [{ name: "Plugins", path: "/docs/plugins" }],
  },
];

type SidebarType = Array<{
  name: string;
  path: string;
  chapters: Array<{ name: string; path: string }>;
}>;
