$(document).ready(function(){
  let romajiDict = {};
  let conversionHistory = [];

  $.ajax({
    url: "romaji.json",
    type: "GET",
    dataType: "json",
    success: function(data) {
      romajiDict = data;
    },
    error: function(xhr, status, error) {
      console.error("Gagal memuat romaji.json:", error);
      $("#result").text("Gagal memuat data konversi.");
    }
  });

  function convertToRomaji(angka){
    if(romajiDict[angka]) return romajiDict[angka];

    let hasil = [];
    let unit_angka = ["", "juu", "hyaku", "sen", "man"];
    let panjang = angka.length;

    for(let i=0; i<panjang; i++){
      let digit = angka[i];
      if(digit !== "0"){
        let unit = unit_angka[panjang - i - 1];
        
        if(unit === "sen" && digit === "3") hasil.push("sanzen");
        else if(unit === "sen" && digit === "8") hasil.push("hassen");
        else if(unit === "hyaku" && ["3","6","8"].includes(digit)){
          let special = {"3": "sanbyaku", "6": "roppyaku", "8": "happyaku"};
          hasil.push(special[digit]);
        }
        else if(unit === "man" && digit === "1") hasil.push("ichiman");
        else {
          hasil.push(romajiDict[digit]);
          if(unit) hasil.push(unit);
        }
      }
    }
    return hasil.join(" ");
  }

  function updateResult(number) {
    if($.isNumeric(number) && parseInt(number) >= 0 && parseInt(number) <= 99999){
      let result = convertToRomaji(number);
      $("#result").text(result).addClass("fade-in");
      $("#number").removeClass("invalid-input").addClass("valid-input");
      // Add to history
      conversionHistory.unshift({ number, result });
      if(conversionHistory.length > 5) conversionHistory.pop();
      updateHistory();
      return result;
    } else {
      $("#result").text("Masukkan angka valid (0-99.999).");
      $("#number").removeClass("valid-input").addClass("invalid-input");
      return null;
    }
  }

  function updateHistory() {
    $("#history").empty();
    conversionHistory.forEach(({ number, result }) => {
      $("#history").append(`<li class="py-1">${number} → ${result}</li>`);
    });
  }

  // Restrict input to numbers only
  $("#number").on("input", function(){
    let number = $(this).val();
    $(this).val(number.replace(/[^0-9]/g, '')); // hanya angka
    updateResult(number);
  });

  // Convert button click
  $("#convertBtn").click(function(){
    let number = $("#number").val();
    updateResult(number);
  });

  // Copy to clipboard
  $("#copyBtn").click(function(){
    let resultText = $("#result").text();
    if(resultText !== "-" && resultText !== "Masukkan angka valid (0-99.999).") {
      navigator.clipboard.writeText(resultText).then(() => {
        let $tooltip = $(this).find(".tooltip");
        $tooltip.text("Copied!").css("background-color", "#4ade80");
        setTimeout(() => {
          $tooltip.text("Copy").css("background-color", "#1f2937");
        }, 1000);
      });
    }
  });
});
