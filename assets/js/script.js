const searchList = $(".custom-sidenav");
const forecastCards = $(".forecast-cards");

const APIkey = "a718a3edd5e0eea00f271a7877b47a08";

let cityName;
let search;
let searchArray = JSON.parse(localStorage.getItem("search-city")) || [];
let currentCardArray = JSON.parse(localStorage.getItem("current-weather")) || [];
let forecastCardArray = JSON.parse(localStorage.getItem("forecast-weather")) || [{},{},{},{},{}];

function getAPI() {
  let queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIkey;

    fetch(queryURL)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {

        console.log(data);

        if ($("#error-message")) {
            $("#error-message").remove();
        }

        if (data.cod >= 400) {
            let errorMessage = $("<p>" + data.message + "</p>").attr("id","error-message");
            $(".form-outline").append(errorMessage);
            console.log(data.message);
            return
        }

        let getCity = data.name;



        if (search) {
          for (i = 0; i < searchArray.length; i++) {
            let isContainedWithin = searchArray[i].toLowerCase();
            if (isContainedWithin === cityName) {
                searchArray.splice(i, 1);
            }
          }

          // Update array for recent search options
          searchArray.unshift(getCity);

          if (searchArray.length > 10) {
            searchArray.pop();
          }

          localStorage.setItem("search-city", JSON.stringify(searchArray))
          renderSearchList();
        }
        

        // Fetch other weather information
        let lat = data.coord.lat;
        let lon = data.coord.lon;
        let UVqueryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&exclude=minutely,hourly,alerts&appid=" + APIkey;
        fetch(UVqueryURL)
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            console.log(data);
            // TO DO: Set all data to currentCardArray & forcastCardArray and separate to external function.
            // Set variables to local storage in arrays.

            // Date
            let currentDate = moment.unix(data.current.dt).format("MM/DD/YYYY");

            // Icon representation of weather conditions
            let currentIcon = data.current.weather[0].icon; 
            let currentIconDescription = data.current.weather[0].description;
            
            // Temperature
            let currentTemp = data.current.temp;

            // Humidity
            let currentHumidity = data.current.humidity;

            // Wind Speed
            let currentWindSpeed = data.current.wind_speed;

            // UV Index
            let currentUVIndex = data.current.uvi;

            currentCardArray = [{"name": getCity, "date": currentDate, "icon": currentIcon, "description": currentIconDescription, "temp": currentTemp, "humidity": currentHumidity, "wind": currentWindSpeed, "uvi": currentUVIndex}];
            localStorage.setItem("current-weather", JSON.stringify(currentCardArray));
            
            // Forecast
            for (i = 1; i < 6; i++) {
              // Date
              let forecastDate = moment.unix(data.daily[i].dt).format("MM/DD/YYYY");

              // Icon representation of weather conditions
              let forecastIcon = data.daily[i].weather[0].icon; 
              let forecastIconDescription = data.current.weather[0].description;
            
              // Temperature
              let forecastTemp = data.daily[i].temp.day;

              // Wind Speed
              let forecastWindSpeed = data.daily[i].wind_speed;

              // Humidity
              let forecastHumidity = data.daily[i].humidity;

              forecastCardArray[i - 1] = {"date": forecastDate, "icon": forecastIcon, "description": forecastIconDescription, "temp": forecastTemp, "humidity": forecastHumidity, "wind": forecastWindSpeed};
              localStorage.setItem("forecast-weather", JSON.stringify(forecastCardArray));
            }
            renderWeatherCards();
        }); 
      });
    }

// Sidenavbar from bootstrap
const searchInputSidenav = document.getElementById('search-input-sidenav');
const sidenavOptions = document.querySelectorAll('#sidenav-3 li .sidenav-link');

searchInputSidenav.addEventListener('input', () => {
  const filter = searchInputSidenav.value.toLowerCase();
  showSidenavOptions();
  const valueExist = !!filter.length;

  if (valueExist) {
    sidenavOptions.forEach((el) => {
      const elText = el.textContent.trim().toLowerCase();
      const isIncluded = elText.includes(filter);
      if (!isIncluded) {
        el.style.display = 'none';
      }
    });
  }
});

const showSidenavOptions = () => {
  sidenavOptions.forEach((el) => {
    el.style.display = 'flex';
  });
};
// Sidenavbar end




// Render and populate recent search list
function renderSearchList() {
    $(".city-button").remove();

    for (i=0; i < searchArray.length; i++) {

        const makeCityList = $("<li></li>");
        const makeCityButton = $("<button></button>").attr("class", "city-button col-1").attr("id","city" + i).text(searchArray[i]);
        makeCityList.append(makeCityButton);
        searchList.append(makeCityList);        
    }

    // Invoke generateHandler() during the loop. It will return a function that has access to its vars/params. 
    // Solution to make for event listener for loop found on https://stackoverflow.com/questions/7774636/jquery-event-handler-created-in-loop
    function generateHandler( j ) {
      return function() { 
        cityName = searchArray[j];
        search = false;
        getAPI();
      };
    }

    for (i=0; i < searchArray.length; i++) {
      $("#city"+i).on("click", generateHandler(i));
    }
    
}

function renderWeatherCards() {

  // Set text for html elements of current weather card.
  $("#current-card-header").text(currentCardArray[0].name + " " + "(" + currentCardArray[0].date + ")");
  $("#current-icon").attr("src", "https://openweathermap.org/img/wn/" + currentCardArray[0].icon + "@2x.png");
  $("#current-icon").attr("alt", currentCardArray[0].description);
  $("#current-temp").text("Temp: " + currentCardArray[0].temp + " \xB0F");
  $("#current-humidity").text("Humidity: " + currentCardArray[0].humidity + "%");
  $("#current-wind-speed").text("Wind: " + currentCardArray[0].wind + " MPH");
  $("#current-UV-index").text("UV Index: ");
  let colorUV = $("<span>" + currentCardArray[0].uvi + "</span>");
  $("#current-UV-index").append(colorUV);
  colorUV.addClass("UVText");

  if (currentCardArray[0].uvi < 3) {
    colorUV.removeAttr("id", "UVRed");
    colorUV.removeAttr("id", "UVOrange");
    colorUV.removeAttr("id", "UVYellow");
    colorUV.attr("id", "UVGreen");
  }
  else if (currentCardArray[0].uvi >= 3 && currentCardArray[0].uvi< 6) {
    colorUV.removeAttr("id", "UVRed");
    colorUV.removeAttr("id", "UVOrange");
    colorUV.removeAttr("id", "UVGreen");
    colorUV.attr("id", "UVYellow");
  }
  else if (currentCardArray[0].uvi >= 6 && currentCardArray[0].uvi < 8) {
    colorUV.removeAttr("id", "UVRed");
    colorUV.removeAttr("id", "UVGreen");
    colorUV.removeAttr("id", "UVYellow");
    colorUV.attr("id", "UVOrange");
  }
  else {
    colorUV.removeAttr("id", "UVGreen");
    colorUV.removeAttr("id", "UVOrange");
    colorUV.removeAttr("id", "UVYellow");
    colorUV.attr("id", "UVRed");
  }

  // Set text for html elements of forecast weather cards.
  for (i = 0; i < forecastCardArray.length; i++) {
    
    $(".forecast-card-header"+i).text(forecastCardArray[i].date);
    $(".forecast-icon"+i).attr("src", "https://openweathermap.org/img/wn/" + forecastCardArray[i].icon + "@2x.png");
    $(".forecast-icon"+i).attr("alt", forecastCardArray[i].description);
    $(".forecast-temp"+i).text("Temp: " + forecastCardArray[i].temp + " \xB0F");
    $(".forecast-humidity"+i).text("Humidity: " + forecastCardArray[i].humidity + "%");
    $(".forecast-wind-speed"+i).text("Wind: " + forecastCardArray[i].wind + " MPH");
  }
}

renderSearchList();

renderWeatherCards();

$("#myBtn").on("click", function() {
  cityName = $("#search-input-sidenav").val().toLowerCase();
  search = true;
  getAPI();
});
