document.addEventListener('DOMContentLoaded', function() {
    console.log("RUN");
    
    // Set default dates
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    document.getElementById('checkin').valueAsDate = today;
    document.getElementById('checkout').valueAsDate = tomorrow;
    
    // Load XML data and initialize the page
    loadReservedAreas();
    
    // Search button functionality
    document.getElementById('search-btn').addEventListener('click', function() {
        const capacity = parseInt(document.getElementById('capacity').value);
        const checkin = document.getElementById('checkin').value;
        const checkout = document.getElementById('checkout').value;
        
        if (!checkin || !checkout) {
            alert('Please select both check-in and check-out dates');
            return;
        }
        
        // For now just reloads with the current filter values
        loadReservedAreas();
    });
    
    // Date validation
    document.getElementById('checkin').addEventListener('change', function() {
        const checkinDate = new Date(this.value);
        const checkoutDate = new Date(document.getElementById('checkout').value);
        
        if (checkinDate > checkoutDate) {
            const nextDay = new Date(checkinDate);
            nextDay.setDate(nextDay.getDate() + 1);
            document.getElementById('checkout').valueAsDate = nextDay;
        }
    });
    
    document.getElementById('checkout').addEventListener('change', function() {
        const checkinDate = new Date(document.getElementById('checkin').value);
        const checkoutDate = new Date(this.value);
        
        if (checkoutDate <= checkinDate) {
            const nextDay = new Date(checkinDate);
            nextDay.setDate(nextDay.getDate() + 1);
            this.valueAsDate = nextDay;
        }
    });
});

function loadReservedAreas() {
    fetch('reserved_areas.xml')
        .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(xml => {
            const areas = xml.querySelectorAll('area');
            const areaGrid = document.getElementById('area-grid');
            areaGrid.innerHTML = ''; // Clear existing content
            
            const capacityFilter = parseInt(document.getElementById('capacity').value) || 1;
            
            areas.forEach(area => {
                const areaId = area.querySelector('id').textContent;
                const name = area.querySelector('name').textContent;
                const cost = parseFloat(area.querySelector('cost').textContent).toFixed(2);
                const booked = area.querySelector('booked').textContent === 'true';
                const capacity = parseInt(area.querySelector('capacity').textContent);
                const imagePath = area.querySelector('image_path').textContent;
                const description = area.querySelector('description').textContent;
                
                // Skip areas that don't meet capacity requirements
                if (capacity < capacityFilter) return;
                
                // Create area box
                const areaBox = document.createElement('div');
                areaBox.className = `area-box ${booked ? 'booked' : ''}`;
                areaBox.dataset.id = areaId;
                areaBox.dataset.name = name;
                areaBox.dataset.cost = cost;
                areaBox.dataset.capacity = capacity;
                areaBox.dataset.description = description;
                areaBox.dataset.image = imagePath;
                
                // Add area number
                const areaNumber = document.createElement('div');
                areaNumber.className = 'area-number';
                areaNumber.textContent = areaId;
                areaBox.appendChild(areaNumber);
                
                // Add area name
                const areaName = document.createElement('div');
                areaName.className = 'area-name';
                areaName.textContent = name;
                areaBox.appendChild(areaName);
                
                // Add area status
                const areaStatus = document.createElement('div');
                areaStatus.className = 'area-status';
                areaStatus.textContent = booked ? 'Booked' : 'Available';
                areaBox.appendChild(areaStatus);
                
                // Add capacity info
                const areaCapacity = document.createElement('div');
                areaCapacity.className = 'area-capacity';
                areaCapacity.textContent = `${capacity} people`;
                areaBox.appendChild(areaCapacity);
                
                // Add mouseover event for tooltip
                areaBox.addEventListener('mouseover', showAreaTooltip);
                areaBox.addEventListener('mouseout', hideAreaTooltip);
                
                // Add click event for selection
                if (!booked) {
                    areaBox.addEventListener('click', selectArea);
                }
                
                areaGrid.appendChild(areaBox);
            });
        })
        .catch(error => {
            console.error('Error loading reserved areas:', error);
            alert('Error loading reserved areas data. Please try again later.');
        });
}

let areaBox;
let tooltip;

function showAreaTooltip(event) {
    areaBox = event.currentTarget;
    tooltip = document.createElement('div');
    tooltip.className = 'area-tooltip';
    
    tooltip.innerHTML = `
        <h3>${areaBox.dataset.name}</h3>
        <p><strong>Status:</strong> ${areaBox.classList.contains('booked') ? 'Booked' : 'Available'}</p>
        <p><strong>Capacity:</strong> ${areaBox.dataset.capacity} people</p>
        <p><strong>Cost:</strong> $${areaBox.dataset.cost}</p>
        <p>${areaBox.dataset.description}</p>
        <img src="${areaBox.dataset.image}" alt="${areaBox.dataset.name}" class="tooltip-image">
    `;
    
    // Position the tooltip near the mouse
    tooltip.style.position = 'absolute';
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY - 300}px`;
    
    document.body.appendChild(tooltip);
    areaBox._tooltip = tooltip;
}

function hideAreaTooltip(event) {
    areaBox = event.currentTarget;
    tooltipId = areaBox._tooltip;
     if (tooltipId) {
        document.body.removeChild(tooltipId);
        delete areaBox._tooltip;
    }
}

function selectArea(event) {
    // Remove selection from all areas
    document.querySelectorAll('.area-box').forEach(box => {
        box.classList.remove('selected');
    });
    
    // Add selection to clicked area
    const areaBox = event.currentTarget;
    areaBox.classList.add('selected');
    
    // "store" the selected area for booking
    console.log('Selected area:', {
        id: areaBox.dataset.id,
        name: areaBox.dataset.name,
        cost: areaBox.dataset.cost,
        capacity: areaBox.dataset.capacity
    });
}