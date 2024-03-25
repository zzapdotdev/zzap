export async function registerRoot(RootComponent: any) {
  const ReactDOMClient = await import("react-dom/client");
  const hydrateRoot = ReactDOMClient.hydrateRoot;

  const root = document.querySelector("#zzap-root");

  if (root) {
    hydrateRoot(root, <RootComponent {...window.__zzap.props} />);
  }

  console.log("REGISTERING", RootComponent);
}

declare global {
  interface Window {
    __zzap: {
      props: any;
    };
  }
}
