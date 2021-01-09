'use strict';
//hash algorithm

var _sparkMd = require('spark-md5');

var _sparkMd2 = _interopRequireDefault(_sparkMd);

var _jsSha = require('js-sha256');

var _jsSha2 = _interopRequireDefault(_jsSha);

require('./styles/styles.scss');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// http://cz.archive.ubuntu.com/ubuntu/pool/universe/a/android-platform-system-core/android-libcrypto-utils_8.1.0+r23-5_amd64.deb

var addressInput = document.querySelector('[data-address-input]');
//scss

var checkInput = document.querySelector('[data-check-input]');
var checkButton = document.querySelector('[data-check-button]');
var downloadButton = document.querySelector('[data-download-button]');
var message = document.querySelector('[data-message-alert]');
var fileInput = document.querySelector('[data-file-input]');
var fileButton = document.querySelector('[data-label-for-fileInput]');
var fileSpan = document.getElementById('file-span');

var verifier = function verifier() {

    //messages field
    //show up a hash shortcut after fill in an address input
    var hashMessage = function hashMessage() {
        message.style.color = "#DAA520";
        message.style.border = "none";
        checkInput.style.border = "none";
        addressInput.style.border = "none";
    };
    //bad message
    var badMessage = function badMessage() {
        message.style.color = "#DC143C";
        message.style.border = "1px solid #DC143C";
    };

    //good message
    var goodMessage = function goodMessage() {
        message.style.color = "#228B22";
        message.style.border = "1px solid #228B22";
        downloadButton.style.display = "flex";
        downloadButton.style.background = "#4B0082";
        downloadButton.style.color = "#fff";
        downloadButton.style.borderBottom = "5px solid rgb(51, 2, 87)";
        downloadButton.style.cursor = "pointer";
        checkInput.style.border = "none";
        addressInput.style.border = "none";
    };

    //fileButton
    var fileButtonMsg = function fileButtonMsg() {
        fileButton.style.color = "#fff";
        fileButton.style.fontSize = "1.2rem";
    };

    //file input field
    var fileLoader = function fileLoader() {
        if (fileInput.files.length == 0) {
            // alert('load a file');
            message.innerHTML = "Załaduj plik do obliczenia skrótu!";
            fileButton.innerHTML = "Załaduj plik!";
            fileButtonMsg();
            fileButton.style.background = "#B22222";
            fileButton.style.borderBottom = "5px solid #8B0000";
            badMessage();
            return;
        } else if (fileInput.files.length == 1) {
            fileButton.innerHTML = "Plik załadowany";
            // alert('file loaded');
            fileButtonMsg();
            fileButton.style.background = "#008000";
            fileButton.style.borderBottom = "5px solid #006400";
        };
    };

    //checkButton
    checkButton.addEventListener("click", function (e) {
        e.preventDefault();

        fileLoader();
        //generate the MD5 algorytm from a file    
        var calculateMD5Hash = function calculateMD5Hash(file, bufferSize) {
            var def = Q.defer();
            //get the file from download location     
            var fileReader = new FileReader();
            var fileSlicer = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
            var hashAlgorithm = new _sparkMd2.default();

            var totalParts = Math.ceil(file.size / bufferSize);
            var currentPart = 0;

            fileReader.onload = function (e) {
                currentPart += 1;

                def.notify({
                    currentPart: currentPart,
                    totalParts: totalParts
                });

                var buffer = e.target.result;
                hashAlgorithm.appendBinary(buffer);

                if (currentPart < totalParts) {
                    processNextPart();
                    return;
                };

                def.resolve({
                    hashResult: hashAlgorithm.end()
                });
            };

            fileReader.onerror = function (e) {
                def.reject(e);
            };

            var processNextPart = function processNextPart() {
                var start = currentPart * bufferSize;
                var end = Math.min(start + bufferSize, file.size);
                fileReader.readAsBinaryString(fileSlicer.call(file, start, end));
            };

            processNextPart();
            return def.promise;
        };
        //check the input if it's not empty and calculate the MD5 hash of a file
        var calculate = function calculate() {

            var input = fileInput;
            if (!input.files.length) return;

            var file = input.files[0];
            var bufferSize = Math.pow(1024, 2) * 10;

            calculateMD5Hash(file, bufferSize, checkInput).then(function (hashResult) {
                //check if fileInput is not empty
                //alert(hashResult);
                var myCheck = {
                    hashResult: checkInput.value
                };
                //hash array
                var hash = [];
                // console.log(hash);
                // console.log(hash.length);
                var myJson = JSON.stringify(hashResult).toUpperCase();
                var myHash = JSON.stringify(myCheck).toUpperCase();
                // console.log(myJson)
                // console.log(myHash)

                //add MD5 hashes to the array 
                hash.unshift(myJson);
                hash.unshift(myHash);
                // console.log(hash)

                //clear the array
                var clear = function clear(hash) {
                    hash = [];
                    return;
                };

                //generate and compare an input value and a loaded file's hash
                //if compared successfully show up the message and a downloadButton
                //if not equal show up a fail message and hide the downloadButton   
                if (hash[0] === hash[1] && addressInput.value !== '') {
                    message.innerHTML = 'Skr\xF3t prawid\u0142owy';
                    goodMessage();
                    clear();
                } else if (hash[0] !== hash[1] && checkInput.value !== '') {
                    message.innerHTML = 'Skr\xF3t nieprawid\u0142owy';
                    badMessage();
                    downloadButton.style.display = "none";
                    checkInput.style.border = "none";
                    addressInput.style.border = "none";
                    clear();
                } else if (addressInput.value === '' && checkInput.value === '') {
                    checkInput.style.border = "1.4px solid #FF0000";
                    addressInput.style.border = "1.4px solid #FF0000";
                    message.innerHTML = "Pola nie mogą być puste!";
                    badMessage();
                    downloadButton.style.display = "none";
                    return;
                } else if (addressInput.value === '') {
                    // alert('adres nie może być pusty');
                    message.innerHTML = 'Pole adresu nie może być puste';
                    badMessage();
                } else {
                    var _myJson = JSON.stringify(hashResult).toLowerCase();
                    message.innerHTML = 'MD5 hash: ' + _myJson;
                    hashMessage();
                    clear();
                }
                // downloadButton
                // redirect to value of an addressInput
                downloadButton.addEventListener('click', function (e) {
                    var url = addressInput.value;
                    window.location.reload(url);
                    window.open(url);
                    e.preventDefault();
                    clear();
                    return;
                });
            }, function (err) {
                if (err) {
                    alert(err);
                }return;
            }, function (progress) {
                // show the progress notification
                // console.log(progress.currentPart, 'of', progress.totalParts, 'Total bytes:', progress.currentPart * bufferSize, 'of', progress.totalParts * bufferSize);
            });
        };
        calculate();
    }, false);
};
verifier();
