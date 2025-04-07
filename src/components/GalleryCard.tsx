import NFTCard from "./NFTCard";

const GalleryCard = () => {
  const nfts = Array(12)
    .fill(null)
    .map((_, i) => ({
      id: `${i + 1}`,
      image: "/assets/EtherealEntities.png",
      name: "Ethereal Entities",
      price: Math.random() * 100, // Mengubah 'value' menjadi 'price' untuk konsistensi dengan NFTCard
    }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {nfts.map((nft, index) => (
        <NFTCard
          key={nft.id}
          nft={nft}
          index={index} // Untuk animasi stagger
        />
      ))}
    </div>
  );
};

export default GalleryCard;
