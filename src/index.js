'use strict'
//hash algorithm
import SparkMD5, { hash } from 'spark-md5';
import sha256 from 'js-sha256';
//scss
import './styles/styles.scss';

// http://cz.archive.ubuntu.com/ubuntu/pool/universe/a/android-platform-system-core/android-libcrypto-utils_8.1.0+r23-5_amd64.deb

const addressInput = document.querySelector('[data-address-input]');
const checkInput = document.querySelector('[data-check-input]');
const checkButton = document.querySelector('[data-check-button]');
const downloadButton = document.querySelector('[data-download-button]');
const message = document.querySelector('[data-message-alert]');
const fileInput = document.querySelector('[data-file-input]');
const fileButton = document.querySelector('[data-label]');

const verifier = (() => {

    //messages field
        //show up a hash shortcut after fill in an address input
    const hashMessage = (() => {
        message.style.color = "#DAA520";
        message.style.border = "none";
        checkInput.style.border = "none";
        addressInput.style.border = "none";
    });
        //bad message
    const badMessage = (() => {
        message.style.color = "#DC143C";
        message.style.border = "1px solid #DC143C";
    });

        //good message
    const goodMessage = (() => {
        message.style.color = "#228B22";
        message.style.border = "1px solid #228B22";
        downloadButton.style.display = "flex";
        downloadButton.style.background = "#4B0082";
        downloadButton.style.color = "#fff";
        downloadButton.style.borderBottom = "5px solid rgb(51, 2, 87)";
        downloadButton.style.cursor = "pointer";
        checkInput.style.border = "none";
        addressInput.style.border = "none";
    });

    //fileButton
    const fileButtonMsg = (() => {
        fileButton.style.color = "#fff";
        fileButton.style.fontSize = "1.2rem";
    });

    //file input field
    const fileLoader = (() => {
        if (fileInput.files.length == 0){
            // alert('load a file');
            message.innerHTML = "Load a file to calculate the MD5 hash!";
            fileButton.innerHTML = "Load a file!";
            fileButtonMsg();
            fileButton.style.background = "#B22222";
            fileButton.style.borderBottom = "5px solid #8B0000";
            badMessage();   
            return;
        } else if (fileInput.files.length == 1 ) {
            fileButton.innerHTML = "File loaded correctly";
            // alert('file loaded');
            fileButtonMsg();
            fileButton.style.background = "#008000";
            fileButton.style.borderBottom = "5px solid #006400";
        };
    });
    
    //checkButton
    checkButton.addEventListener("click", ((e) => {
        e.preventDefault();

    fileLoader();    
        //generate the MD5 algorytm from a file    
        const calculateMD5Hash = ((file, bufferSize) => {
            const def = Q.defer();
            //get the file from download location     
            const fileReader = new FileReader();
            const fileSlicer = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
            const hashAlgorithm = new SparkMD5();
                
            const totalParts = Math.ceil(file.size / bufferSize);
            let currentPart = 0;
            
            fileReader.onload = ((e) => {
                currentPart += 1;
            
                def.notify({
                    currentPart,
                    totalParts,
                });
            
                const buffer = e.target.result;
                hashAlgorithm.appendBinary(buffer);

                if (currentPart < totalParts) {
                    processNextPart(); 
                    return;
                };
                //MD5 hash
                def.resolve({
                    hashResult: hashAlgorithm.end(),
                    });
                });

                fileReader.onerror = ((e) =>{ 
                    def.reject(e);
                });
            
                const processNextPart = (() => {
                    const start = currentPart * bufferSize;
                    const end = Math.min(start + bufferSize, file.size);
                    fileReader.readAsBinaryString(fileSlicer.call(file, start, end));
                });
            
                processNextPart();
                return def.promise;
            });
            //check the input if it's not empty and calculate the MD5 hash of a file
            const calculate = (() => {

                const input = fileInput;
                if (!input.files.length) return;
                    
            
                const file = input.files[0];
                const bufferSize = Math.pow(1024, 2) * 10;
                // calculate and show MD5 hash
                calculateMD5Hash(file, bufferSize, checkInput).then(
                ((hashResult) => {
                    //check if fileInput is not empty
                        //alert(hashResult);
                    const myCheck = {
                        hashResult: checkInput.value,
                    };
                    //hash array
                    const hash = [];
                        // console.log(hash);
                        // console.log(hash.length);
                    const myJson = JSON.stringify(hashResult).toUpperCase();
                    const myHash = JSON.stringify(myCheck).toUpperCase();
                        // console.log(myJson)
                        // console.log(myHash)

                    //add MD5 hashes to the array 
                    hash.unshift(myJson);
                    hash.unshift(myHash);
                        // console.log(hash)
                    
                    //clear the array
                    const clear = ((hash) => {
                        hash = [];
                        return;
                    });
                    
                //generate and compare an input value and a loaded file's hash
                    //if compared successfully show up the message and a downloadButton
                    //if not equal show up a fail message and hide the downloadButton   
                    if (hash[0] === hash[1] && addressInput.value !== '') {
                        message.innerHTML = `MD5 hash correct`;
                        goodMessage();
                        clear();
                    }  else if (hash[0] !== hash[1] && checkInput.value !== '') {
                        message.innerHTML = `MD5 hash not correct!`;
                        badMessage();
                        downloadButton.style.display = "none";
                        checkInput.style.border = "none";
                        addressInput.style.border = "none";
                        clear();
                    } else if (addressInput.value === '' && checkInput.value === '') {
                        checkInput.style.border = "1.4px solid #FF0000";
                        addressInput.style.border = "1.4px solid #FF0000";
                        message.innerHTML = "Fields cannot be empty!";
                        badMessage();
                        downloadButton.style.display = "none";
                        return;
                    } else if (addressInput.value === '' && checkInput.value !== '') {
                        // alert('adres nie może być pusty');
                        message.innerHTML = 'Address cannot be empty!';
                        checkInput.style.border = "none";
                        badMessage();
                    } else  {
                        const myJson = JSON.stringify(hashResult).toLowerCase();
                        message.innerHTML = `MD5 hash: ${myJson}`;
                        hashMessage();
                        clear();
                    }
                    // downloadButton
                    // redirect to value of an addressInput
                    downloadButton.addEventListener('click', (e) => {
                        const url = addressInput.value;
                        window.location.reload(url);
                        window.open(url);
                        e.preventDefault();
                        clear();
                        return;
                    })
                }),
                ((err) =>{
                    if (err) {
                        alert(err)
                    } return;
                }),
                ((progress) => {
                // show the progress notification
                    // console.log(progress.currentPart, 'of', progress.totalParts, 'Total bytes:', progress.currentPart * bufferSize, 'of', progress.totalParts * bufferSize);
            }));
        });
        calculate();
    }), false);
});
verifier();