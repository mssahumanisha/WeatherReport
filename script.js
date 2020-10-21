// VARIABLES

var searchButton = $("#search"); // jQuery DOM objects
var inputEl = $("#cityQuery");
var cityNameH2 = $("#cityName");
var currentDateH2 = $("#currentDate");
var weatherEmojiTodayEl = $("#weatherEmoji");
var tempMainEl = $("#temp-main");
var humidityMainEl = $("#humidity-main");
var windMainEl = $("#wind-main");
var uvMainEl = $("#UV-main");
var fiveDayDiv = $("#fiveDayContainer");
var fiveDayH3 = $("#fiveDayHead");
var mainCardDiv = $("#card-div");
var secondCardDiv = $("#card-div-2");
var searchHistoryUl = $("#searchHistory");

var currentCity;

var APIKey = "c9d43ea44c719a1c7bfa973c77a3170b";

var allSearches = JSON.parse(localStorage.getItem("previousSearches")) || []; // Retrieve old searches, if any

var moment = moment();

// FUNCTIONS

function citySearch() { // Displays weather data for a new city
    

    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + currentCity + "&units=imperial&appid=" + APIKey;

    if (currentCity != null) { // Query for basic weather info for city (if city is typed in)
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (cityWeatherData) {

            mainCardDiv.css("display", "block"); // Show the main columns
            secondCardDiv.css("display", "block");

            inputEl.val("");


            console.log(cityWeatherData)
            cityNameH2.text(cityWeatherData.name);
            currentDateH2.text("(" + moment.format('MMMM DD YYYY') + ")");

            var weatherIcon = displayIcons(cityWeatherData);

            weatherEmojiTodayEl.attr("src", weatherIcon);

            tempMainEl.text("Temperature: " + Math.floor(cityWeatherData.main.temp) + " F");
            humidityMainEl.text("Humidity: " + cityWeatherData.main.humidity +"%");
            windMainEl.text("Wind Speed: " + Math.floor(cityWeatherData.wind.speed) + " mph");

            var uvQuery = "https://api.openweathermap.org/data/2.5/uvi?lat=" + cityWeatherData.coord.lat + "&lon=" + cityWeatherData.coord.lon + "&appid=" + APIKey;


            $.ajax({  // Query for UV Index Data
                url: uvQuery,
                method: "GET"
            }).then(function (uvData) {
                uvMainEl.text(uvData.value);
                uvColorCode(uvMainEl, uvData.value);

            })

            var fiveDayURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + currentCity + "&units=imperial&appid=" + APIKey;

            $.ajax({
                url: fiveDayURL, // Query for 5 Day Forecast
                method: "GET"
            }).then(function (fiveDayData) {
                console.log(fiveDayData);

                fiveDayH3.css("display", "block"); //Show Five Day Forecast heading
                var day = 1;

                fiveDayDiv.empty();

                for (var i = 5; i < fiveDayData.list.length; i += 8) { //Generate card for each of the five days
                    var weatherImage = displayIcons(fiveDayData.list[i]);

                    var dayEl = $(`
                    <div class="card five-day">
                        <div class="card-body">
                            <h5 class="card-title">Day ${day}</h5>
                            <img src="${weatherImage}" class="card-text fiveDayImg">
                            <p class="card-text">Temp: ${Math.floor(fiveDayData.list[i].main.temp)} F</p>
                            <p class="card-text">Humidity: ${fiveDayData.list[i].main.humidity}%</p>
                        </div>
                    </div>
                    `)
                    fiveDayDiv.append(dayEl);
                    day++;
                }

            })
        })
    }
}

function loadSearches() { // Display list of previous searches from local storage
    for (var index = 0; index < allSearches.length; index++) {
        var searchedItem = $(`<li class="list-group-item search-history" value="${allSearches[index]}">${allSearches[index]}</li>`);
        searchHistoryUl.prepend(searchedItem);
    }
}

function uvColorCode(element, number) { // Color code the UV index
    console.log(element, number);
    if (number < 3) {
        element.addClass("lowUV");
    } else if (number >= 3 && number < 8) {
        element.addClass("mediumUV");
    } else {
        element.addClass("highUV");
    }
}

function displayIcons(weatherData) { // Assigning images to each type of weather
    if (weatherData.weather[0].description === "clear sky") {
        return "http://openweathermap.org/img/wn/01d@2x.png";
    } else if (weatherData.weather[0].description === "few clouds"){
        return "http://openweathermap.org/img/wn/02d@2x.png";
    } else if (weatherData.weather[0].description === "scattered clouds" || weatherData.weather[0].description === "overcast clouds"){
        return "http://openweathermap.org/img/wn/03d@2x.png";
    } else if (weatherData.weather[0].description === "broken clouds"){
        return "http://openweathermap.org/img/wn/04d@2x.png";
    } else if (weatherData.weather[0].description === "shower rain" || weatherData.weather[0].description === "light rain"){
        return "http://openweathermap.org/img/wn/09d@2x.png";
    } else if (weatherData.weather[0].description === "rain"){
        return "http://openweathermap.org/img/wn/10d@2x.png";
    } else if (weatherData.weather[0].description === "thunderstorm"){
        return "http://openweathermap.org/img/wn/11d@2x.png";
    } else if (weatherData.weather[0].description === "snow"){
        return "http://openweathermap.org/img/wn/13d@2x.png";
    } else if (weatherData.weather[0].description === "mist"){
        return "http://openweathermap.org/img/wn/50d@2x.png";
    } else {
        return "";
    }
}

//MAIN PROCESSES

console.log(moment.format('MMMM DD YYYY'));

window.addEventListener('load', function () {

    loadSearches(); // Loads previous searches


    searchButton.on("click", function(event) { // When the user clicks search button
        event.preventDefault();

        currentCity = inputEl.val().trim();
        console.log(currentCity);

        var previouslySearchedLi = $(`<li class="list-group-item search-history" value="${currentCity}">${currentCity}</li>`); // Add city to list of previously searched

        allSearches.push(currentCity);

        localStorage.setItem("previousSearches", JSON.stringify(allSearches)); // Save searches to local storage

        searchHistoryUl.prepend(previouslySearchedLi); // Add city to list of previous searches

        citySearch();
    });

    searchHistoryUl.on("click", function (event) { // When user clicks a city in the search history
        var listItem = $(event.target);
        currentCity = listItem[0].firstChild.data;
        console.log(listItem, currentCity);
        citySearch();
    })
})