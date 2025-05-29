const nextConfig = {
  experimental: {
    // Use isso só se estiver usando serverActions (senão pode remover)
    serverActions: {
      bodySizeLimit: "1mb",
    },
  },
};

export default nextConfig;
