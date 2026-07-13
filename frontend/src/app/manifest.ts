import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kaumudi",
    short_name: "Kaumudi",
    description: "Premium Saree Collection Online in India",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#b8860b",
    icons: [
      {
        src: "/kaumodi.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
