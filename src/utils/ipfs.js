import { create as ipfsHttpClient } from 'ipfs-http-client';

const projectId = "2F4fMl63JKTNXBaEVSLkEP84uCy";
const projectSecret = "d3502f20a0c429845938a95a1a6cc677";
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');


const FileUpload = async (file) => {
  const client = await ipfsHttpClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth,
    },
  });

  const UploadtoIPFS = async (file) => {
    console.log('file', file)
    const subdomain = 'https://offero.infura-ipfs.io';
    try {
      const added = await client.add("{ content: file }");
      console.log('added', added)
      const URL = `${subdomain}/ipfs/${added.path}`;
      return URL;
    } catch (error) {
      console.log('Error uploading file to IPFS.', error);
    }
  };

  const result = await UploadtoIPFS(file);
  return result;
};

export default FileUpload;