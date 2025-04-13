document.addEventListener('DOMContentLoaded', () => {
    const newRecordForm = document.getElementById('new-record-form');
    const recordList = document.getElementById('record-list');
    const fetchRecordsButton = document.getElementById('fetch-records');
    const createMessageDiv = document.getElementById('create-message');
    const updateFormDiv = document.getElementById('update-form');
    const updateRecordForm = document.getElementById('update-record-form');
    const updateMessageDiv = document.getElementById('update-message');
    const cancelUpdateButton = document.getElementById('cancel-update');

    let records = []; 

    function displayMessage(element, message, isError = false) {
        element.textContent = message;
        element.className = isError ? 'error' : 'success';
    }

    // Function to fetch and display all records
    async function fetchAllRecords() {
        try {
            const response = await fetch('/api/records');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            records = await response.json();
            renderRecords(records.json);
        } catch (error) {
            console.error('Failed to fetch records:', error);
            displayMessage(document.getElementById('read-records'), 'Failed to load records.', true);
        }
    }

    function renderRecords(records) {
        recordList.innerHTML = '';
        records.forEach(record => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                ${record.id}: ${record.name} (${record.email})
                <button class="edit-btn" data-id="${record.id}">Edit</button>
                <button class="delete-btn" data-id="${record.id}">Delete</button>
            `;
            recordList.appendChild(listItem);
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', editRecord);
        });
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', deleteRecord);
        });
    }

    newRecordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        try {
            const response = await fetch('/api/records', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email }),
            });

            const data = await response.json();
            if (response.ok) {
                displayMessage(createMessageDiv, 'Record created successfully!');
                newRecordForm.reset();
                fetchAllRecords(); 
            } else {
                displayMessage(createMessageDiv, `Failed to create record: ${data.message || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error creating record:', error);
            displayMessage(createMessageDiv, 'Failed to create record due to a network error.', true);
        }
    });

    fetchRecordsButton.addEventListener('click', fetchAllRecords);

    function editRecord(event) {
        const recordId = event.target.dataset.id;
        const recordToEdit = records.json.find(record => record.id === recordId);
        if (recordToEdit) {
            document.getElementById('update-id').value = recordToEdit.id;
            document.getElementById('update-name').value = recordToEdit.name;
            document.getElementById('update-email').value = recordToEdit.email;
            updateFormDiv.style.display = 'block';
        }
    }

    updateRecordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('update-id').value;
        const name = document.getElementById('update-name').value;
        const email = document.getElementById('update-email').value;

        try {
            const response = await fetch(`/api/records/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email }),
            });

            const data = await response.json();
            if (response.ok) {
                displayMessage(updateMessageDiv, 'Record updated successfully!');
                updateFormDiv.style.display = 'none';
                fetchAllRecords();
            } else {
                displayMessage(updateMessageDiv, `Failed to update record: ${data.message || 'Unknown error'}`, true);
            }
        } catch (error) {
            console.error('Error updating record:', error);
            displayMessage(updateMessageDiv, 'Failed to update record due to a network error.', true);
        }
    });

    cancelUpdateButton.addEventListener('click', () => {
        updateFormDiv.style.display = 'none';
        updateMessageDiv.textContent = '';
    });

    async function deleteRecord(event) {
        const recordId = event.target.dataset.id;
        if (confirm(`Are you sure you want to delete record ${recordId}?`)) {
            try {
                const response = await fetch(`/api/records/${recordId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    displayMessage(document.getElementById('read-records'), `Record ${recordId} deleted successfully!`);
                    fetchAllRecords(); 
                } else {
                    const data = await response.json();
                    displayMessage(document.getElementById('read-records'), `Failed to delete record: ${data.message || 'Unknown error'}`, true);
                }
            } catch (error) {
                console.error('Error deleting record:', error);
                displayMessage(document.getElementById('read-records'), 'Failed to delete record due to a network error.', true);
            }
        }
    }

    fetchAllRecords();
});