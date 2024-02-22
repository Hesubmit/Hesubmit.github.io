// This part adds the base map
    mapboxgl.accessToken = "pk.eyJ1IjoiaGVzdWJtaXQiLCJhIjoiY2xyNmVpOWtpMmI1djJwdDNybTZqZGZ0ZCJ9.GW0MsXnXcZe-ulZawb6HHg";
    const map = new mapboxgl.Map({
        container: "map", // container element id
        style: "mapbox://styles/hesubmit/clsw0ss0q001701oibwh36bcf",
        center: [-0.1276, 51.5072],
        zoom: 9,
        projection: "equirectangular"
    });
    map.addControl(new mapboxgl.ScaleControl(), "bottom-right");
    // This part links to the mapbox dataset
    const data_url =
  "https://api.mapbox.com/datasets/v1/hesubmit/clsvmq3rg2gb91ml3xsd8x8u3/features?access_token=pk.eyJ1IjoiaGVzdWJtaXQiLCJhIjoiY2xyNmVpOWtpMmI1djJwdDNybTZqZGZ0ZCJ9.GW0MsXnXcZe-ulZawb6HHg";
    
    //const filterInput = document.getElementById('filter-input');
    const filterEl = document.getElementById('filter-input');
    
    let airports = [];
// This part adds the layer to the map
    map.on("load", () => {


    map.addSource("counties", {
        type: "geojson",
        data: data_url
    });
    map.addLayer({
        id: "sites",
        type: "circle",
        sourcelayer: "original",
        source: "counties",
        paint: {
        "circle-radius": 4,
        "circle-color": [
            "match",
            ["get", "classification"],
            "Airport",
            "red",
            "Breathe London",
            "blue",
            "LAQN network",
            "magenta",
            "AQE network",
            "yellow",
            /* other */ "grey"
        ],
        "circle-opacity": 1
        }
    });
    map.on('movestart', () => {
        // reset features filter as the map starts moving
        map.setFilter('sites', ['has', 'sitename']);
    });
    map.on('moveend', () => {
        const features = map.queryRenderedFeatures({ layers: ['sites'] });

        if (features) {
            const uniqueFeatures = getUniqueFeatures(features, 'sitename');
                // Populate features for the listing overlay.
            renderListings(uniqueFeatures);

                // Clear the input container
            filterEl.value = '';

                // Store the current features in sn `airports` variable to
                // later use for filtering on `keyup`.
            airports = uniqueFeatures;
        }
    });
    // Code from the next step will go here.
    //Create a new pop up with the style defined in the CSS as my-popup.
    //
    filterEl.addEventListener('keyup', (e) => {
            const value = normalize(e.target.value);

            // Filter visible features that match the input value.
            const filtered = [];
            for (const feature of airports) {
                const name = normalize(feature.properties.sitename);
                const code = normalize(feature.properties.classification);
                if (name.includes(value) || code.includes(value)) {
                    filtered.push(feature);
                }
            }

            // Populate the sidebar with filtered results
            renderListings(filtered);

            // Set the filter to populate features into the layer.
            if (filtered.length) {
                map.setFilter('sites', [
                    'match',
                    ['get', 'sitename'],
                        filtered.map((feature) => {
                            return feature.properties.sitename;
                        }),
                    true,
                    false
                ]);
            }
        });

        // Call this function on initialization
        // passing an empty array to render an empty state
        renderListings([]);


    window.popup = new mapboxgl.Popup({
            offset: [0, -40],
            className: "my-popup",
            closeButton: true,
            closeOnClick: true,
    })
    window.popup.on('close', function (e) {  
           // 查找名为table的div  
        var tableDiv = document.getElementById("table");     
        var marker = document.getElementsByClassName("marker")[0]
    // 如果找到了该div  
        if (tableDiv) {  
            // 查找其父元素  
            var parentElement = tableDiv.parentElement;  
                
            // 如果找到了父元素，则删除该div  
            if (parentElement) {  
                parentElement.removeChild(tableDiv); 
                parentElement.style.display = "none";   
            }  
        }
        if(marker){
            var markerparentElement = marker.parentElement;
            if(markerparentElement) {
                markerparentElement.removeChild(marker);            
            } 
        }
    });
  // This part create an event listener and zooms to the selected point
    map.on("click", (event) => {
        console.log(event);
        //map.setPaintProperty('sites', 'circle-color', '#666');  
        // If the user clicked on one of your markers, get its information.
        const features = map.queryRenderedFeatures(event.point, {
            layers: ["sites"] // replace with your layer name
        });
        if (!features.length) {
        return;
        }
        const feature = features[0];
        const el = document.createElement('div');
        el.className = 'marker';
        // make a marker for each feature and add to the map
        new mapboxgl.Marker(el).setLngLat(feature.geometry.coordinates).addTo(map);
        let id = feature.properties.id;
        let tableInit = { features: [] };
        tableInit["features"].push(feature);
        tableinit(tableInit);
        //Fly to the point when clicked
        map.flyTo({
            center: feature.geometry.coordinates, //keep this
            zoom: 15 //change fly to zoom level
        });
        popup.setLngLat(feature.geometry.coordinates) //Set the loctaion of the pop up to the marker's long and lat using
            .setHTML(
                //Create some html with a heading h3, and two paragraphs p to display some properties of the marker.
                `<h3>${feature.properties.sitename}</h3> 
                <p>Sitetype:  ${feature.properties.sitetype}</p>
                <p>easting:  ${feature.properties.easting}</p>
                <p>latitude:  ${feature.properties.latitude}</p>
                <p><a href=${feature.properties.url}>Click for more information</a></p>`
            ) //${feature.properties.xxx} is used to refer to a certain property in the data.
            .addTo(map); //Add this pop up to the map.
        });
        document.getElementById("filters").addEventListener("change", (event) => {
            filterC = ["==", ["get", "classification"], "network"]; //for checkbox A, if checked, get category A buildings //Else, do nothing
            var checkBoxA = document.getElementById("ACheck");
            if (checkBoxA.checked == true) {
            filterA = ["==", ["get", "classification"], "Airport"];
            } else {
            filterA = ["==", ["get", "classification"], "placeholder"];
            } //for checkbox B, if checked, get category B buildings //Else, do nothing
            var checkBoxB = document.getElementById("BCheck");
            if (checkBoxB.checked == true) {
            filterB = ["==", ["get", "classification"], "Breathe London"];
            } else {
            filterB = ["==", ["get", "classification"], "placeholder"];
            } //for checkbox C, if checked, get category C buildings //Else, do nothing
            var checkBoxC = document.getElementById("CCheck");
            if (checkBoxC.checked == true) {
            filterC = ["==", ["get", "classification"], "LAQN network"];
            } else {
            filterC = ["==", ["get", "classification"], "placeholder"];
            }
            var checkBoxD = document.getElementById("DCheck");
            if (checkBoxD.checked == true) {
            filterD = ["==", ["get", "classification"], "AQE network"];
            } else {
            filterD = ["==", ["get", "classification"], "placeholder"];
            } //Set the filter based on the applied filter rules
            map.setFilter("sites", ["any", filterA, filterB, filterC, filterD]);
        });
        // const geocoder = new MapboxGeocoder({
        //     // Initialize the geocoder
        //     accessToken: mapboxgl.accessToken, // Set the access token
        //     mapboxgl: mapboxgl, // Set the mapbox-gl instance
        //     marker: false, // Do not use the default marker style
        //     placeholder: "Search for a place in London", // Placeholder text for the search bar
        //     proximity: {
        //     longitude: -0.1276,
        //     latitude: 51.5072
        //     } // Coordinates of London center
        // });

       // map.addControl(geocoder, "top-right");

        //This adds the find my location control
        map.addControl(new mapboxgl.GeolocateControl());
        //This adds navigation control
        map.addControl(new mapboxgl.NavigationControl());
        });
       
    function tableinit(data) {
            var tableContainer = document.getElementById('tableContainer');  
            console.log(tableContainer)
            // 如果找到了该div  
            if (tableContainer) {  
                // 将它的display属性从'none'改为''（空字符串），以使其显示  
                tableContainer.style.display = "";  
            }
            const table = document.createElement("table");
            table.id = 'table'
            table.style.width = "100%";
            table.style.borderCollapse = "collapse"; // 创建表头行
            var thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            console.log(data);
            var properties = data["features"][0]["properties"];
            // 遍历properties对象并创建表头单元格
            for (var key in properties) {
                if (properties.hasOwnProperty(key)) {
                // 创建表头单元格
                var th = document.createElement("th");
                th.textContent = key; // 设置单元格文本为键名
                headerRow.appendChild(th); // 将单元格添加到表头行
                }
            }
            // 将表头行添加到表头
            thead.appendChild(headerRow);
            // 将表头添加到表格
            table.appendChild(thead);
            var features = data["features"];
            const objectsArray = [];
            for (var index in features) {
                var items = features[index]["properties"];
                var itemtr = document.createElement("tr");
                for (var it in items) {
                if (items.hasOwnProperty(it)) {
                    // 创建表头单元格
                    var itth = document.createElement("th");
                    itth.textContent = items[it]; // 设置单元格文本为键名
                    itemtr.appendChild(itth); // 将单元格添加到表头行
                }
                }
                table.appendChild(itemtr);
                objectsArray.push(features[index]["properties"]);
            }
            // 将表格添加到容器中
            tableContainer.appendChild(table);
        }
    const listingEl = document.getElementById('feature-listing');

    function renderListings(features) {
        const empty = document.createElement('p');
        // Clear any existing listings
        listingEl.innerHTML = '';
        if (features.length) {
            for (const feature of features) {
                const itemLink = document.createElement('a');
                const span = document.createElement('a');       
                const label = `${feature.properties.sitename} (${feature.properties.classification})`;
                span.href = feature.properties.url;
                span.textContent = '    go'
                itemLink.target = '_blank';
                itemLink.textContent = label;
                itemLink.addEventListener('click',()=>{
                    map.flyTo({
                        center: feature.geometry.coordinates, //keep this
                        zoom: 18 //change fly to zoom level
                    });
                    window.popup.setLngLat(feature.geometry.coordinates) //Set the loctaion of the pop up to the marker's long and lat using
                    .setHTML(
                        //Create some html with a heading h3, and two paragraphs p to display some properties of the marker.
                        `<h3>${feature.properties.sitename}</h3> 
                        <p>Sitetype:  ${feature.properties.sitetype}</p>
                        <p>easting:  ${feature.properties.easting}</p>
                        <p>latitude:  ${feature.properties.latitude}</p>
                        <p><a href=${feature.properties.url}>Click for more information</a></p>`
                    ) //${feature.properties.xxx} is used to refer to a certain property in the data.
                    .addTo(map); //Add this pop up to the map.
                    let tableInit = { features: [] };
                    tableInit["features"].push(feature);
                    tableinit(tableInit);
                                      const el = document.createElement('div');
                    el.className = 'marker';
                    // make a marker for each feature and add to the map
                    new mapboxgl.Marker(el).setLngLat(feature.geometry.coordinates).addTo(map);
                })
                itemLink.addEventListener('mouseover', () => {
                    // Highlight corresponding feature on the map
    
                });
                itemLink.appendChild(span)
                listingEl.appendChild(itemLink);
                
                
            }

            // Show the filter input
            filterEl.parentNode.style.display = 'block';
        } else if (features.length === 0 && filterEl.value !== '') {
            empty.textContent = 'No results found';
            listingEl.appendChild(empty);
        } else {
            empty.textContent = 'Drag the map to populate results';
            listingEl.appendChild(empty);

            // Hide the filter input
            filterEl.parentNode.style.display = 'none';

            // remove features filter
            map.setFilter('sites', ['has', 'sitename']);
        }
    }

    function normalize(string) {
        return string.trim().toLowerCase();
    }
    function getUniqueFeatures(features, comparatorProperty) {
        const uniqueIds = new Set();
        const uniqueFeatures = [];
        for (const feature of features) {
            const id = feature.properties[comparatorProperty];
            if (!uniqueIds.has(id)) {
                uniqueIds.add(id);
                uniqueFeatures.push(feature);
            }
        }
        return uniqueFeatures;
    }
        document.getElementById('toggleButton').addEventListener('click', function() {
        var div = document.getElementById('filter-ctrl');
        var button = document.getElementById('toggleButton');
        console.log(div.style.display)
        if (div.style.display === 'none') {
            console.log("0")
            div.style.display = 'block'; // 显示div
            button.style.background = 'red'
        } else {
            console.log("1")
            div.style.display = 'none'; // 隐藏div
            button.style.background = 'yellow'
        }
    });
    var button = document.getElementById('toggleButton');
    button.click();