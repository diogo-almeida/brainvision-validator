// All functions to validate a BrainVision file triplet
var fs = require("fs");
var path = require("path");

module.exports = {

    /**
     * assertIsVHDR - Assert that the file has a .vhdr extension.
     *
     * @param  {string} vhdrPath path to the file to be tested
     * @return {boolean}
     */
    assertIsVHDR: function(vhdrPath){
        ext = path.extname(vhdrPath);
        if (ext != '.vhdr') {
            return false;
        }
        return true;
    },


    /**
     * assertBVTriplet - Asssert that internal links in the file triplet work
     *
     * .vhdr contains links to .eeg and .vmrk; and .vmrk also contains a
     * link to .eeg
     *
     * @param  {type} vhdrPath path to the file to be tested
     * @return {boolean}
     */
    assertBVTriplet: function(vhdrPath) {
        // read the contents of the vhdr file
        var vhdrContent = fs.readFileSync(vhdrPath, 'utf8');

        // Find the links to the data and marker files
        var eegRe = new RegExp('DataFile=(.*\.eeg)');
        var vmrkRe = new RegExp('MarkerFile=(.*\.vmrk)');

        var eegBaseName = vhdrContent.match(eegRe)[1];
        var vmrkBaseName = vhdrContent.match(vmrkRe)[1];

        // get the full paths to eeg and marker files
        var basePath = path.dirname(vhdrPath);
        var eegPath = path.join(basePath, eegBaseName);
        var vmrkPath = path.join(basePath, vmrkBaseName);

        // check that marker file exists and try to find its link to datafile
        var dataFileLinksGood = false;
        if (fs.existsSync(vmrkPath)) {
            var vmrkContent = fs.readFileSync(vmrkPath, 'utf8');
            dataFileLinksGood = eegBaseName == vmrkContent.match(eegRe)[1];
        }

        // data file has to exist and be consistently linked to
        if (fs.existsSync(eegPath) && dataFileLinksGood) {
            return true;
        } else {
            return false;
        }
    }
};
