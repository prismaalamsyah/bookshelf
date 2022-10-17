let books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const UPDATE_EVENT = "update-book";
const STORAGE_KEY = "BOOK_APPS";


// search
function searchBook(query) {
  let text = query.target.value.toLowerCase();
  if (text) {
    // currData = JSON.parse(localStorage.length > 0 ? localStorage.getItem(STORAGE_KEY) : {});

    books = books.filter((book) => {
      return book.title.toLowerCase().includes(text);
    });
  } else {
    books = [];
    document.dispatchEvent(new Event(RENDER_EVENT));
    console.log(books);
    loadDataFromStorage();

  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}
document.getElementById("search-field").addEventListener("keyup", searchBook);

// generate unique Id
function generateUniqueId() {
  return +new Date();
}

// make a new Object
function newObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

// find a book
function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

// find book index
function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

// checking function for localStorage is exists
function checkStorageExists() {
  if (typeof Storage === undefined) {
    alert("Your Browser Did Not Support Local Storage!");
    return false;
  }
  return true;
}



// save data into localStorage
function saveData(bookTarget, type) {
  if (checkStorageExists()) {

    if (type === "create") {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed)
    } else if (type === "completed" || type === "") {
      const currData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const filter = currData.filter(item => item?.id !== bookTarget?.id)
      const newData = [...filter, ...books]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
    }
  }
}

// load data from localStorage
function loadDataFromStorage() {
  const serializedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (serializedData !== null) {
    for (const book of serializedData) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

// make changes to the form button (checkbox)
function changeBtn() {
  const boxIsChecked = document.getElementById("inputBookIsComplete");
  if (boxIsChecked.checked) {
    document.getElementById("text-list").innerText = "Selesai dibaca";
    return true;
  } else {
    document.getElementById("text-list").innerText = "Belum selesai dibaca";
    return false;
  }
}

document
  .getElementById("inputBookIsComplete")
  .addEventListener("change", changeBtn);

// make new data of book
function newBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;
  const bookTitle = document.createElement("h3");
  bookTitle.innerText = title;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = `Penulis: ${author}`;

  const bookYear = document.createElement("p");
  bookYear.innerText = `Tahun: ${year}`;

  // create container as wrapper for title, author and year
  const bookContainer = document.createElement("div");
  bookContainer.classList.add("inner_item");
  bookContainer.append(bookTitle, bookAuthor, bookYear);

  // create article for bookContainer
  const bookArticle = document.createElement("article");
  bookArticle.classList.add("book_item");
  bookArticle.append(bookContainer);

  if (isComplete) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.addEventListener("click", () => {
      // TODO add function for undoButton
      undoBookFromCompleteList(id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", () => {
      // TODO add function for deleteButton
      removeBookFromList(id);
    });

    const actionsButton = document.createElement("button");
    actionsButton.classList.add("actions");
    actionsButton.append(undoButton, deleteButton);
    bookArticle.append(actionsButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");
    checkButton.addEventListener("click", () => {
      addBookToCompleteList(id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", () => {
      removeBookFromList(id);
    });

    const actionsButton = document.createElement("button");
    actionsButton.classList.add("actions");
    actionsButton.append(checkButton, deleteButton);
    bookArticle.append(actionsButton);
  }
  return bookArticle;
}
// add Book into books
function addBookIntoBooks() {
  const idBook = generateUniqueId();
  const titleBook = document.getElementById("inputBookTitle").value;
  const authorBook = document.getElementById("inputBookAuthor").value;
  const yearBook = document.getElementById("inputBookYear").value;
  const isCompleted = changeBtn();

  const bookObject = newObject(
    idBook,
    titleBook,
    authorBook,
    yearBook,
    isCompleted
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData([], "create");
  document.dispatchEvent(new Event(SAVED_EVENT));
}

// add Book Data into completed list
function addBookToCompleteList(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData(bookTarget, "completed");
  document.dispatchEvent(new Event(UPDATE_EVENT));
}

// remove Book Data from list
function removeBookFromList(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;

  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to remove this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      books.splice(bookTarget, 1);
      Swal.fire("Deleted!", "Book has been deleted.", "success");
      saveData(bookTarget, "uncompleted");
      document.dispatchEvent(new Event(RENDER_EVENT));
    }
  });
}

// undo Book Data from Complete list
function undoBookFromCompleteList(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  document.dispatchEvent(new Event(UPDATE_EVENT));
}

// custom event handler for save data
document.addEventListener(SAVED_EVENT, () => {
  Swal.fire({
    position: "center",
    icon: "success",
    title: "Data saved successfully",
    showConfirmButton: false,
    timer: 1000,
  });
});
document.addEventListener(UPDATE_EVENT, () => {
  Swal.fire({
    position: "center",
    icon: "success",
    title: "Data updated successfully",
    showConfirmButton: false,
    timer: 1000,
  });
});

// custom event handler for rendering data of books
document.addEventListener(RENDER_EVENT, () => {
  const incompleteBookshelfList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completeBookshelfList = document.getElementById(
    "completeBookshelfList"
  );

  // reset list item of books
  incompleteBookshelfList.innerHTML = "";
  completeBookshelfList.innerHTML = "";

  for (const bookItem of books) {
    const bookElementList = newBook(bookItem);
    if (bookItem.isComplete) {
      completeBookshelfList.append(bookElementList);
    } else {
      incompleteBookshelfList.append(bookElementList);
    }
  }
});

// event handlers for all HTML DOMs loaded
document.addEventListener("DOMContentLoaded", () => {
  const sumbitForm = document.getElementById("inputBook");
  sumbitForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    addBookIntoBooks();
  });
  if (checkStorageExists()) loadDataFromStorage();
});