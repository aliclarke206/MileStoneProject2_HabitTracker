//Select DOM
const listsContainer = document.querySelector("[data-lists]");
const newListForm = document.querySelector("[data-new-list-form]");
const newListInput = document.querySelector("[data-new-list-input]");
const deleteListButton = document.querySelector("[data-delete-list-button]");
const listDisplayContainer = document.querySelector("[data-list-display-container]");
const listTitleElement = document.querySelector("[data-list-title]");
const listCountElement = document.querySelector("[data-list-count]");
const tasksContainer = document.querySelector("[data-tasks]");
const taskTemplate = document.getElementById("task-template");
const newTaskForm = document.querySelector('[data-new-task-form]');
const newTaskInput = document.querySelector('[data-new-task-input]');
const clearCompleteTasksButton = document.querySelector('[data-clear-complete-task-button]');
const number = document.querySelector(".number");

const LOCAL_STORAGE_LIST_KEY = 'task.lists';
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId';
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY));

/*Progress Bar Script*/

class ProgressBar {
    constructor (element, initialValue = 0){
        this.valueElem = element.querySelector(".progress-bar-value");
        this.fillElem = element.querySelector(".progress-bar-fill");

        this.setValue(initialValue);
    }

    setValue (newValue) {
        if(newValue < 0){
            newValue = 0;
        }

        if(newValue > 100) {
            newValue = 100;
        }

        this.value = newValue
        this.update();
    }

    update (){
        const percentage = this.value + "%";

        this.fillElem.style.width = percentage;
        this.valueElem.textContent = percentage;
    }
}
/*Given a list calculate the percentage of completed tasks*/
function progressPercent (list) {
 const incompleteTaskCount = list.tasks.filter(task => !task.complete).length;
 const completeTaskCount = list.tasks.filter(task => task.complete).length;
 const totalTaskCount = (list.tasks.filter(task => !task.complete).length) + (list.tasks.filter(task => task.complete).length);

 return Math.round((completeTaskCount/totalTaskCount)*100);

}

const selectedList = lists.find( list => list.id == selectedListId);
let taskProgressBar = new ProgressBar(document.querySelector(".progress-bar"), progressPercent(selectedList));


//Event Listenters
//Selecting a category and calling associated functions
listsContainer.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'li') {
    selectedListId = e.target.dataset.listId
    saveAndRender()
    taskProgressBar.setValue(progressPercent(selectedList));
  }
})   
//selecting tasks and running associated functions
tasksContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'input') {
        const selectedList = lists.find(list => list.id == selectedListId)
        const selectedTask = selectedList.tasks.find(task => task.id == e.target.id)
        selectedTask.complete = e.target.checked
        save()
        renderTaskCount(selectedList)
        taskProgressBar.setValue(progressPercent(selectedList));
        
    }
})
//selecting clear complete task button and calling functions
clearCompleteTasksButton.addEventListener('click', _e => {
    const selectedList = lists.find(list => list.id === selectedListId)
    selectedList.tasks = selectedList.tasks.filter(task => !task.complete)
    saveAndRender()
})
//selecting delete category button and calling functions
deleteListButton.addEventListener("click", _e => {
    lists = lists.filter(list => list.id !== selectedListId)
    selectedListId = null
    saveAndRender()
})
//adding a new category on submit
newListForm.addEventListener("submit", e => {
    e.preventDefault()
    const listName = newListInput.value
    if(listName == null || listName === "") return
    const list = createList(listName)
    newListInput.value = null 
    lists.push(list)
    saveAndRender()
    
} )
//adding a new task on submit
newTaskForm.addEventListener('submit', e => {
  e.preventDefault()
  const taskName = newTaskInput.value
  if (taskName == null || taskName === '') return
  const task = createTask(taskName)
  newTaskInput.value = null
  const selectedList = lists.find(list => list.id == selectedListId)
  selectedList.tasks.push(task)
  saveAndRender()
})

//Functions
//create category
function createList (name) {
   return {id: Date.now().toString(), name: name, tasks: [] }
}
//create task
function createTask (name) {
     return {id: Date.now().toString(), name: name, complete: false }

}
//save and call functions
function saveAndRender() {
  save()
  render()
}
//save items to local storage
function save() {
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists))
  localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId)
}
//clears and adds list and task functions
function render() {
    clearElement(listsContainer);
    renderLists();

    const selectedList = lists.find( list => list.id == selectedListId)
    if (selectedListId === null) {
        listDisplayContainer.style.display = "none"
    } else {
        listDisplayContainer.style.display = ''
        listTitleElement.innerText = selectedList.name
        renderTaskCount(selectedList)
        clearElement(tasksContainer)
        renderTasks(selectedList);
        taskProgressBar.setValue(progressPercent(selectedList));
        
    }

    function renderTasks (selectedList) {
        selectedList.tasks.forEach(task => {
            const taskElement = document.importNode(taskTemplate.content, true)
            const checkbox = taskElement.querySelector("input")
            checkbox.id = task.id
            checkbox.checked = task.complete
            const label =  taskElement.querySelector("label")
            label.htmlFor = task.id
            label.append(task.name)
            tasksContainer.appendChild(taskElement)
        })
    }
    
}
//function to calculate the number of tasks remaining
function renderTaskCount (selectedList){
        const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length
        const taskString = incompleteTaskCount === 1 ? "task" : "tasks"
        listCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`
        taskProgressBar.setValue(progressPercent(selectedList));
    }
//Creates new list item
function renderLists () {
    lists.forEach(list => {
        const listElement = document.createElement("li")
        listElement.dataset.listId = list.id
        listElement.classList.add("list-name")
        listElement.innerText = list.name
        if(list.id === selectedListId) {
            listElement.classList.add('active-list')
        }
        listsContainer.appendChild(listElement)
    })
}
// removes div element from page when item has been deleted
function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild)
    }

}

render()
