import {create as ipfsHttpClient} from 'ipfs-http-client';

const projectId = "2F4fMl63JKTNXBaEVSLkEP84uCy";
const projectSecret = "d3502f20a0c429845938a95a1a6cc677";
const subDomain = "offero"
const auth ='Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const FileUpload = async (file) => {
    const client = await ipfsHttpClient({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers:{
            authorization: auth,
        },
    });

    const UploadtoIPFS = async (file) => {
        const subdomain = 'https://offero.infura-ipfs.io';
        try {
         const added = await client.add({ content: file });
         const URL = `${subdomain}/ipfs/${added.path}`;
         return URL;
       } catch (error) {
         console.log('Error uploading file to IPFS.', error);
       }
    };

    const result =  await UploadtoIPFS(file);
    return result;
  };


export default FileUpload;

//const FileUpload = async (file) => {
//    const ipfs = create('https://ipfs.infura.io:5001/api/v0');
//    try {
//        var ipfsresult = await ipfs.add(file);
//        return `https://ipfs.infura.io/ipfs/${ipfsresult.path}`;
//    } catch (err) {
//        return false;
//    }
//};

