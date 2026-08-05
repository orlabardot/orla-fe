/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Imagens de variantes vêm de um bucket S3/R2 configurado por tenant/ambiente,
    // então o hostname não é fixo — não há como restringir para um domínio único.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
