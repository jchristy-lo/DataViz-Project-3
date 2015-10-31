window.addEventListener("load", run);

function run() {
    var updateViz = function () {
    };
}

getDataRows = function (category, site) {
    return data.filter(function (row) {
        //return (!category || row.category === category || row.category === "all") && (!site || row.site === site);
        return (!category || row.category === category) && (!site || row.site === site);
    });
};