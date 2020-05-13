var part1 = document.getElementById("report-loader-part1"),
    load_part1_bar = part1.querySelector(".report-loader-bar-complete"),
    load_part1_desc = part1.querySelector(".report-loader-part-desc"),
    loader_part1 = {
      bar: load_part1_bar,
      desc: load_part1_desc
    };

var part2 = document.getElementById("report-loader-part2"),
    load_part2_bar = part2.querySelector(".report-loader-bar-complete"),
    load_part2_desc = part2.querySelector(".report-loader-part-desc"),
    loader_part2 = {
      bar: load_part2_bar,
      desc: load_part2_desc
    };

var part3 = document.getElementById("report-loader-part3"),
    load_part3_bar = part3.querySelector(".report-loader-bar-complete"),
    load_part3_desc = part3.querySelector(".report-loader-part-desc"),
    loader_part3 = {
      bar: load_part3_bar,
      desc: load_part3_desc
    };

export { loader_part1 as loaderPart1 };
export { loader_part2 as loaderPart2 };
export { loader_part3 as loaderPart3 };
