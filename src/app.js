const searchUserInput = document.querySelector("#search-input");
const searchUserBtn = document.querySelector("#search-btn");
const searchContainer = document.querySelector("#search-container");
const userContainer = document.querySelector("#user-container");
const userProfileContainer = document.querySelector("#user-profile");
const tabsContainer = document.querySelector("#tabs-container");
const reposContainer = document.querySelector("#repositories-container");
const nav = document.querySelector("nav");
const userProfileUrl = 'https://api.github.com/users/';

searchUserBtn.addEventListener("click", function(e) {
    e.preventDefault();

    getUserProfile(searchUserInput.value);
});

function getUserProfile(username) {
    fetch(`${userProfileUrl}${username}`)
        .then((res) => res.json())
        .then((user) => {
            localStorage.setItem('user', JSON.stringify({username: user.login, repos: user.public_repos}));
            setUserProfile(user);
            getOverviewRepos(user.login, user.public_repos);
        });
}

function getRepos(user, repos) {
    let loopIterator = Math.ceil(repos / 30);
    fetch(`${userProfileUrl}${user}/repos?page=1`)
        .then(res => res.json())
        .then(res => {
            console.log(res);
            buildRepoListContainer(res, loopIterator);
        })
}

function buildRepoListContainer(repos, totalPages) {
    const repoList = `
        ${repos.map((repo) => {
            return buildRepo(repo);
        }).join("")
        }
    `;
    reposContainer.innerHTML = repoList;

}

function buildRepo(repo) {
    return  `
        <div class="repo">
            ${repo.name}
        </div>
        `;
}

function getOverviewRepos(user, repos) {
    let loopIterator = Math.ceil(repos / 30);
    const arr = [];
    let ghRepos;
    for(let i = 0; i < loopIterator; i++) {
        fetch(`${userProfileUrl}${user}/repos?page=${i+1}`)
        .then(res => res.json())
        .then(res => {
            arr.push(res);
            if (i == loopIterator - 1) {
                const a = arr.reduce((acc, val) => acc.concat(val), []);
                a.sort((a, b) => {
                    return a.name - b.name;
                })
                console.log(a);
                ghRepos = getBranches(a, user);
                console.log(ghRepos);
                // localStorage.setItem('repos', JSON.stringify(a))
            }
        });
    }

}

function getBranches(repoArr, user) {
    let ghPagesBranches;
    let newArr = [];
    repoArr.forEach((repo) => {
        fetch(`https://api.github.com/repos/${user}/${repo.name}/branches`)
            .then(res => res.json())
            .then(branches => {
                branches.forEach(branch => {
                    if (branch.name == 'gh-pages') {
                        newArr.push(repo);
                    }
                })
            })
    })
    console.log(newArr);
    return newArr;
}

function hideElement(ele) {
    ele.classList.add('hide');
}

function showElement(ele) {
    ele.classList.remove('hide');
}

function setUserProfile(user) {
    hideElement(searchContainer);
    showElement(userContainer);
    const userInfoSidebar = `   
    <div class="user-info">
        <div class="user-image">
            <img src=${user.avatar_url} alt="user-image" />
        </div>
        <div class="name">${user.name}</div>
        <div class="login">${user.login}</div>
        <div class="bio">${user.bio}</div>
        <div class="blog">
            <a href=${user.blog} target="_blank">${user.blog}</a>
        </div>
        <div class="location">${user.location}</div>
        <div class="github-url">
            <a href=${user.html_url} target="_blank">${user.html_url}</a>
        </div>
    </div>
    
    `;
    
    userProfileContainer.innerHTML = userInfoSidebar;
    addActiveClassToTabs();
}

function addActiveClassToTabs() {
   
    document.addEventListener("click", function(e) {
        e.preventDefault(); 
        if (e.target.localName == "a") {
            let navChilds = nav.children;
            let tabsChildren = tabsContainer.children;
            removeActiveClass(navChilds);
            showCorrespondingContainer(tabsChildren, e.target.id);
            document.querySelector(`#${e.target.id}`).classList.add('active');
        }
        
    });
}

function removeActiveClass(child) {
    for(let i = 0; i < child.length; i++) {
        child[i].classList.remove('active');
    }
}

function showCorrespondingContainer(childrens, id) {
    const obj = JSON.parse(localStorage.getItem('user'));
    if (id == 'repositories') {
        localStorage.removeItem('repos');
        getRepos(obj.username, obj.repos);
    }
    if (id == 'overview') {
        getOverviewRepos(obj.username, obj.repos);
    }
    for(let i = 0; i < childrens.length; i++) {
        if(childrens[i].id.indexOf(id) != -1) {
            childrens[i].classList.remove("hide");
        } else {
            childrens[i].classList.add("hide");
        }
    }
}