const API_URL = 'http://localhost:3000/api/exhibits';
let isEditing = false;

// Load exhibits on page load
document.addEventListener('DOMContentLoaded', () => {
    loadExhibits();
    setupForm();
});

// Load all exhibits and populate the table
async function loadExhibits() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch exhibits');
        }
        const exhibits = await response.json();
        
        displayExhibits(exhibits);
    } catch (error) {
        console.error('Error loading exhibits:', error);
        alert('Failed to load exhibits. Make sure the server is running.');
    }
}

// Display exhibits in the ticket table
function displayExhibits(exhibits) {
    const tbody = document.querySelector('.ticket-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    exhibits.forEach(exhibit => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${exhibit.exhibit_title}</td>
            <td>${exhibit.artist_name || 'N/A'}</td>
            <td>${exhibit.location || 'N/A'}</td>
            <td>
                <button onclick="editExhibit(${exhibit.id})" style="margin-right: 5px; padding: 5px 10px; background: #ffc107; border: none; border-radius: 4px; cursor: pointer;">Edit</button>
                <button onclick="deleteExhibit(${exhibit.id})" style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Setup the ticket inquiry form for CRUD operations
function setupForm() {
    const form = document.querySelector('.ticket-inquiry');
    if (!form) return;
    
    // Clear existing form and rebuild for exhibit management
    form.innerHTML = `
        <input type="hidden" id="exhibit-id">
        
        <label for="exhibit-title">Exhibit Title *</label>
        <input type="text" id="exhibit-title" required>
        
        <label for="artist-name">Artist/Collection Name</label>
        <input type="text" id="artist-name">
        
        <label for="description">Description</label>
        <textarea id="description" style="width: 100%; padding: 8px; min-height: 80px;"></textarea>
        
        <label for="start-date">Start Date</label>
        <input type="date" id="start-date">
        
        <label for="end-date">End Date</label>
        <input type="date" id="end-date">
        
        <label for="location">Location</label>
        <input type="text" id="location">
        
        <button type="submit" style="margin-top: 10px; padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Save Exhibit</button>
        <button type="button" onclick="resetForm()" style="margin-top: 10px; padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
    `;
    
    form.onsubmit = handleSubmit;
}

// Handle form submission (Create or Update)
async function handleSubmit(e) {
    e.preventDefault();
    
    const data = {
        exhibit_title: document.getElementById('exhibit-title').value,
        artist_name: document.getElementById('artist-name').value || null,
        description: document.getElementById('description').value || null,
        start_date: document.getElementById('start-date').value || null,
        end_date: document.getElementById('end-date').value || null,
        location: document.getElementById('location').value || null
    };
    
    try {
        let response;
        const exhibitId = document.getElementById('exhibit-id').value;
        
        if (exhibitId) {
            // Update existing exhibit
            response = await fetch(`${API_URL}/${exhibitId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // Create new exhibit
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        
        if (response.ok) {
            alert(exhibitId ? 'Exhibit updated successfully!' : 'Exhibit created successfully!');
            resetForm();
            loadExhibits();
        } else {
            alert('Operation failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred');
    }
}

// Edit exhibit
async function editExhibit(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch exhibit');
        }
        const exhibit = await response.json();
        
        document.getElementById('exhibit-id').value = exhibit.id;
        document.getElementById('exhibit-title').value = exhibit.exhibit_title;
        document.getElementById('artist-name').value = exhibit.artist_name || '';
        document.getElementById('description').value = exhibit.description || '';
        document.getElementById('start-date').value = exhibit.start_date ? exhibit.start_date.split('T')[0] : '';
        document.getElementById('end-date').value = exhibit.end_date ? exhibit.end_date.split('T')[0] : '';
        document.getElementById('location').value = exhibit.location || '';
        
        // Scroll to form
        document.querySelector('.ticket-inquiry').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading exhibit:', error);
        alert('Failed to load exhibit details');
    }
}

// Delete exhibit
async function deleteExhibit(id) {
    if (!confirm('Are you sure you want to delete this exhibit?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Exhibit deleted successfully!');
            loadExhibits();
        } else {
            alert('Failed to delete exhibit');
        }
    } catch (error) {
        console.error('Error deleting exhibit:', error);
        alert('An error occurred');
    }
}

// Reset form
function resetForm() {
    const form = document.querySelector('.ticket-inquiry');
    if (form) {
        form.reset();
        document.getElementById('exhibit-id').value = '';
    }
}