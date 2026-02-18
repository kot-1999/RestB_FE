document.addEventListener("DOMContentLoaded", async () => {

  const tbody = document.getElementById("bookingsBody");
  if (!tbody) return;

  try {
    const res = await fetch("/api/bookings");
    const bookings = await res.json();

    tbody.innerHTML = "";

    bookings.forEach(b => {

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${b.customerName}</td>
        <td>${b.restaurantName}</td>
        <td>${b.date}</td>
        <td>${b.time}</td>
        <td>${b.partySize}</td>
        <td class="status ${b.status.toLowerCase()}">${b.status}</td>
        <td>
          <button class="approve" data-id="${b.id}">Approve</button>
          <button class="cancel" data-id="${b.id}">Cancel</button>
        </td>
      `;

      tbody.appendChild(row);
    });

  } catch(err) {
    tbody.innerHTML = `<tr><td colspan="7">Could not load bookings</td></tr>`;
    console.error(err);
  }

});
