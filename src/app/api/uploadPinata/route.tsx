const JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhZGM4OGQ0OC0wMDg4LTRjMmMtOGIxMS01NjRkODQxZTMwYzAiLCJlbWFpbCI6ImlyZmFhbnNob29kaXExOTU0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJmNjE4OTRkYzRiNTM3Y2VlZjg4YyIsInNjb3BlZEtleVNlY3JldCI6IjRjNjg1YTIxOWQwM2FiOTAwZWYyMGU1Y2I2MGZhMDRjMzdiODA0ZWE0NWViNDFhZDk1MjM0ZmRiNDkwMThiNjkiLCJleHAiOjE3Njk5NDEwOTZ9.kElikjPEK_-KCZom76QxOroAHEc-2jAmiqBRjrieZJk"; // JWT Anda untuk autentikasi Pinata

async function pinFilesToIPFS() {
  try {
    // 1. Persiapkan file gambar (file1)
    const imageFile = new File(["<image content>"], "image.png", {
      type: "image/png",
    });
    const formData = new FormData();
    formData.append("file", imageFile);

    const pinataMetadata = JSON.stringify({
      name: "Image File",
    });
    formData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append("pinataOptions", pinataOptions);

    // Upload file gambar ke Pinata
    const imageRequest = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
        body: formData,
      }
    );

    const imageResponse = await imageRequest.json();
    if (!imageResponse?.IpfsHash) {
      throw new Error("Failed to upload image");
    }

    const imageCID = imageResponse.IpfsHash;
    console.log("Image uploaded to IPFS. CID:", imageCID);

    // 2. Persiapkan metadata NFT (file2) dengan CID gambar
    const metadata = {
      name: "My NFT",
      description: "This is an example NFT",
      image: `https://gateway.pinata.cloud/ipfs/${imageCID}`, // CID gambar yang baru diupload
    };

    // Membuat file metadata
    const metadataFile = new Blob([JSON.stringify(metadata)], {
      type: "application/json",
    });
    const metadataFileObj = new File([metadataFile], "metadata.json", {
      type: "application/json",
    });

    // Persiapkan formData untuk metadata
    const metadataFormData = new FormData();
    metadataFormData.append("file", metadataFileObj);

    const metadataPinataMetadata = JSON.stringify({
      name: "NFT Metadata",
    });
    metadataFormData.append("pinataMetadata", metadataPinataMetadata);

    const metadataPinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    metadataFormData.append("pinataOptions", metadataPinataOptions);

    // Upload file metadata ke Pinata
    const metadataRequest = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${JWT}`,
        },
        body: metadataFormData,
      }
    );

    const metadataResponse = await metadataRequest.json();
    if (!metadataResponse?.IpfsHash) {
      throw new Error("Failed to upload metadata");
    }

    const metadataCID = metadataResponse.IpfsHash;
    console.log("Metadata uploaded to IPFS. CID:", metadataCID);

    // 3. URL metadata NFT yang sudah terupload
    const metadataURL = `https://gateway.pinata.cloud/ipfs/${metadataCID}`;
    console.log("Metadata URL:", metadataURL);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Panggil fungsi untuk upload file
pinFilesToIPFS();
