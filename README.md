Commands to build sea app (mac os):

1.) node --experimental-sea-config sea-config.json 

2.) Create a copy of the node executable and name it according to your needs:

On systems other than Windows:
cp $(command -v node) hello 

3.) Remove the signature of the binary (macOS and Windows only):
On macOS:
codesign --remove-signature hello 

4.)npx postject hello NODE_SEA_BLOB sea-prep.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA 
5.) codesign --sign - hello 

more info can be found at: https://nodejs.org/api/single-executable-applications.html
