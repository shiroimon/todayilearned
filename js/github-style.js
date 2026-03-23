const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthsFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const now = new Date();
let contributions;

(() => {
    setRelativeTime();
    const dom = document.querySelector('#contributions');
    if (!dom) {
        return;
    }

    contributions = JSON.parse(dom.getAttribute('data'));
    let year = 0;
    for (const item of contributions) {
        item.publishDate = decodeURI(item.publishDate).replace(' ', 'T');
        item.lastmodifyDate = decodeURI(item.lastmodifyDate).replace(' ', 'T');
        item.date = new Date(item.publishDate);
        if (item.date.getFullYear() > year) {
            year = item.date.getFullYear();
        }
        item.title = decodeURI(item.title);
    }

    yearList();
    switchYear(year.toString());
})();

function switchYear(year) {
    let startDate;
    let endDate;
    if (year !== now.getFullYear().toString()) {
        const date = new Date(Number(year), 0, 1, 0, 0, 0, 0);
        startDate = new Date(date.getFullYear(), 0, 1);
        endDate = new Date(date.getFullYear(), 11, 31);
    } else {
        endDate = now;
        startDate = new Date(endDate.getTime() - 364 * 24 * 60 * 60 * 1000 - endDate.getDay() * 24 * 60 * 60 * 1000);
    }
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    const posts = [];
    const ms = [];
    for (const item of contributions) {
        if (item.date >= startDate && item.date <= endDate) {
            posts.push(item);
            const time = item.date.getFullYear().toString() + "-" + item.date.getMonth().toString();
            if (!ms.includes(time)) {
                ms.push(time);
            }
        }
    }
    posts.sort((a, b) => { return b - a });

    // 記事の表示を新しい関数に置き換え
    displayPosts(posts);

    graph(year, posts, startDate, endDate);

    const yearList = document.querySelectorAll('.js-year-link');
    for (const elem of yearList) {
        if (elem.innerText === year) {
            elem.classList.add('selected');
        } else {
            elem.classList.remove('selected');
        }
    }
}

function monthly(year, month, posts, isFirst) {
    const monthPosts = posts.filter(post =>
        post.date.getFullYear().toString() === year && post.date.getMonth() === month
    );
    let liHtml = '';
    const isOverviewPage = window.location.pathname === '/' || window.location.pathname === '/index.html';
    for (const post of monthPosts) {
        const lastmodifyDate = new Date(post.lastmodifyDate);

        liHtml += `<li class="ml-0 py-1 d-flex">
        <div
          class="col-10 css-truncate css-truncate-target lh-condensed width-fit flex-auto min-width-0">
          <a href="${post.link}">${post.title}</a>
        </div>
        <time  title="This post was made on ${months[post.date.getMonth()]} ${post.date.getDate()}, last modified on ${months[lastmodifyDate.getMonth()]} ${lastmodifyDate.getDate()}"
          class="col-2 text-right f6 text-gray-light pt-1" style="white-space: nowrap;">
          ${months[post.date.getMonth()]} ${post.date.getDate()}
          ${!isOverviewPage && post.date.getTime() !== lastmodifyDate.getTime() ? ` (updated: ${months[lastmodifyDate.getMonth()]} ${lastmodifyDate.getDate()})` : ''}
        </time>
      </li>`;
    }
    return `
    <div class="contribution-activity-listing float-left col-12 col-lg-10" style="width: 100%;">
      <div class="width-full pb-4" style="width: 100%;">
        <h3 class="h6 pr-2 py-1 border-bottom mb-3" style="height: 14px;">
          <span class="color-bg-canvas pl-2 pr-3">${monthsFull[month]} <span
              class="text-gray">${monthPosts.length > 0 ? monthPosts[0].date.getFullYear() : year}</span></span>
        </h3>

        <div class="TimelineItem">
          <div class="TimelineItem-badge">
            <svg class="octicon octicon-repo-push" viewBox="0 0 16 16" version="1.1" width="16" height="16">
              <path fill-rule="evenodd"
                d="M1 2.5A2.5 2.5 0 013.5 0h8.75a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0V1.5h-8a1 1 0 00-1 1v6.708A2.492 2.492 0 013.5 9h3.25a.75.75 0 010 1.5H3.5a1 1 0 100 2h5.75a.75.75 0 010 1.5H3.5A2.5 2.5 0 011 11.5v-9zm13.23 7.79a.75.75 0 001.06-1.06l-2.505-2.505a.75.75 0 00-1.06 0L9.22 9.229a.75.75 0 001.06 1.061l1.225-1.224v6.184a.75.75 0 001.5 0V9.066l1.224 1.224z">
              </path>
            </svg>
          </div>
          <div class="TimelineItem-body">
            <details class="Details-element details-reset"${isFirst ? ' open' : ''}>
              <summary role="button" class="btn-link f4 muted-link no-underline lh-condensed width-full">
                <span class="color-text-primary ws-normal text-left">
                  Created ${monthPosts.length} post${monthPosts.length > 1 ? 's' : ''}
                </span>
                <span class="d-inline-block float-right color-icon-secondary">
                  <span class="Details-content--open float-right">
                    <svg class="octicon octicon-fold" viewBox="0 0 16 16" version="1.1" width="16" height="16">
                      <path fill-rule="evenodd"
                        d="M10.896 2H8.75V.75a.75.75 0 00-1.5 0V2H5.104a.25.25 0 00-.177.427l2.896 2.896a.25.25 0 00.354 0l2.896-2.896A.25.25 0 0010.896 2zM8.75 15.25a.75.75 0 01-1.5 0V14H5.104a.25.25 0 01-.177-.427l2.896-2.896a.25.25 0 01.354 0l2.896 2.896a.25.25 0 01-.177.427H8.75v1.25zm-6.5-6.5a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5zM6 8a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5A.75.75 0 016 8zm2.25.75a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5zM12 8a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5A.75.75 0 0112 8zm2.25.75a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5z">
                      </path>
                    </svg></span>
                  <span class="Details-content--closed float-right"><svg class="octicon octicon-unfold"
                      viewBox="0 0 16 16" version="1.1" width="16" height="16">
                      <path fill-rule="evenodd"
                        d="M8.177.677l2.896 2.896a.25.25 0 01-.177.427H8.75v1.25a.75.75 0 01-1.5 0V4H5.104a.25.25 0 01-.177-.427L7.823.677a.25.25 0 01.354 0zM7.25 10.75a.75.75 0 011.5 0V12h2.146a.25.25 0 01.177.427l-2.896 2.896a.25.25 0 01-.354 0l-2.896-2.896A.25.25 0 015.104 12H7.25v-1.25zm-5-2a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5zM6 8a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5A.75.75 0 016 8zm2.25.75a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5zM12 8a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5A.75.75 0 0112 8zm2.25.75a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5z">
                      </path>
                    </svg>
                  </span>
                </span>
              </summary>
              <div>
                <ul class="list-style-none mt-1">
                  ${liHtml}
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>`;
}

function yearList() {
    const years = [];
    for (const item of contributions) {
        const year = item.date.getFullYear();
        if (!years.includes(year)) {
            years.push(year);
        }
    }
    years.sort((a, b) => { return b - a });

    for (let i = 0; i < years.length; i++) {
        const year = years[i];
        const node = document.createElement('li');
        node.innerHTML = `<a class="js-year-link filter-item px-3 mb-2 py-2" onclick="switchYear('${year}')">${year}</a>`;
        document.querySelector('#year-list').appendChild(node);
    }
}

function graph(year, posts, startDate, endDate) {
    const postsStr = posts.length === 1 ? "post" : "posts";
    if (year === now.getFullYear().toString()) {
        document.querySelector('#posts-count').innerText = `${posts.length}  ${postsStr} in the last year`;
    } else {
        document.querySelector('#posts-count').innerText = `${posts.length}  ${postsStr} in ${year}`;
    }

    let html = ``;
    const count = {};
    const updateCount = {};
    for (const post of posts) {
        // 投稿日のカウント
        const date = `${post.date.getFullYear()}-${(post.date.getMonth() + 1).toString().padStart(2, '0')}-${post.date.getDate().toString().padStart(2, '0')}`;
        if (count[date] === undefined) {
            count[date] = 1;
        } else {
            count[date]++;
        }
    }

    // 更新日のカウント（全記事を対象にし、表示範囲内の更新のみカウント）
    for (const post of contributions) {
        const lastmodifyDate = new Date(post.lastmodifyDate);
        if (lastmodifyDate < startDate || lastmodifyDate > endDate) continue;
        // 投稿日と同じ日の更新はスキップ（重複カウント防止）
        const publishDate = new Date(post.publishDate);
        if (lastmodifyDate.getFullYear() === publishDate.getFullYear() &&
            lastmodifyDate.getMonth() === publishDate.getMonth() &&
            lastmodifyDate.getDate() === publishDate.getDate()) continue;
        const updateDate = `${lastmodifyDate.getFullYear()}-${(lastmodifyDate.getMonth() + 1).toString().padStart(2, '0')}-${lastmodifyDate.getDate().toString().padStart(2, '0')}`;
        if (updateCount[updateDate] === undefined) {
            updateCount[updateDate] = 1;
        } else {
            updateCount[updateDate]++;
        }
    }

    const monthPos = [];
    let startMonth = -1;
    const weekday = startDate.getDay();

    for (let i = 0; i < 53; i++) {
        html += `<g transform="translate(${i * 16}, 0)">`;
        for (let j = 0; j < 7; j++) {
            const date = new Date(startDate.getTime() + (i * 7 + j - weekday) * 24 * 60 * 60 * 1000);
            const dataDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            if (date < startDate || date > endDate) {
                continue;
            }

            if (j === 0) {
                if (i <= 51) {
                    if (startMonth !== date.getMonth()) {
                        monthPos.push(i);
                        startMonth = date.getMonth();
                    }
                }
            }

            let c = 0;
            if (count[dataDate] !== undefined) {
                c += count[dataDate];
            }
            if (updateCount[dataDate] !== undefined) {
                c += updateCount[dataDate];
            }

            let color;
            switch (c) {
                case 0:
                    color = "var(--color-calendar-graph-day-bg)";
                    break;
                case 1:
                    color = "var(--color-calendar-graph-day-L1-bg)";
                    break;
                case 2:
                    color = "var(--color-calendar-graph-day-L2-bg)";
                    break;
                case 3:
                    color = "var(--color-calendar-graph-day-L3-bg)";
                    break;
                default:
                    color = "var(--color-calendar-graph-day-L4-bg)";
          }

          let tooltipText = '';
          if (count[dataDate] !== undefined) {
              tooltipText += `${count[dataDate]} post${count[dataDate] > 1 ? 's' : ''}`;
          }
          if (updateCount[dataDate] !== undefined) {
              if (tooltipText) tooltipText += ' and ';
              tooltipText += `${updateCount[dataDate]} update${updateCount[dataDate] > 1 ? 's' : ''}`;
          }

          html += `<rect class="day" width="11" height="11" x="${16 - i}" y="${j * 15}"
          fill="${color}" onmouseover="svgTip(this, '${tooltipText || 'No activity'}', '${dataDate}')" onmouseleave="hideTip()"></rect>`;
        }
        html += '</g>';
    }
    if (monthPos[1] - monthPos[0] < 2) {
        monthPos[0] = -1;
    }
    for (let i = 0; i < monthPos.length; i++) {
        const month = monthPos[i];
        if (month === -1) {
            continue;
        }
        html += `<text x="${15 * month + 16}" y="-9" class="month" style="font-size: 14px;">${months[(i + startDate.getMonth()) % 12]}</text>`;
    }
    html += `
    <text text-anchor="start" class="wday" dx="-10" dy="8" style="display: none; font-size: 14px;">Sun</text>
    <text text-anchor="start" class="wday" dx="-10" dy="25" style="font-size: 14px;">Mon</text>
    <text text-anchor="start" class="wday" dx="-10" dy="32" style="display: none; font-size: 14px;">Tue</text>
    <text text-anchor="start" class="wday" dx="-10" dy="56" style="font-size: 14px;">Wed</text>
    <text text-anchor="start" class="wday" dx="-10" dy="57" style="display: none; font-size: 14px;">Thu</text>
    <text text-anchor="start" class="wday" dx="-10" dy="85" style="font-size: 14px;">Fri</text>
    <text text-anchor="start" class="wday" dx="-10" dy="81" style="display: none; font-size: 14px;">Sat</text>
    `;

    // デスクトップとモバイルの両方のSVGに同じ内容を設定
    document.querySelector('#graph-svg').innerHTML = html;
    document.querySelector('#graph-svg-mobile').innerHTML = html;
}

let svgElem = document.createElement('div');
svgElem.style.cssText = 'pointer-events: none; display: none;';
svgElem.classList.add(...["svg-tip", "svg-tip-one-line"]);
document.body.appendChild(svgElem);

function svgTip(elem, count, dateStr) {
    if (window.screen.width < 768) {
      return;
    }
    const rect = getCoords(elem);
    const date = new Date(dateStr);
    const dateFmt = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    svgElem.innerHTML = `<strong>${count}</strong> on ${dateFmt}`;
    svgElem.style.display = 'block';

    const tipRect = svgElem.getBoundingClientRect();
    svgElem.style.top = `${rect.top - 50}px`;
    svgElem.style.left = `${rect.left - tipRect.width / 2 + rect.width / 2}px`;
}

function hideTip() {
    svgElem.style.display = 'none';
}

function getCoords(elem) {
    const box = elem.getBoundingClientRect();

    const body = document.body;
    const docEl = document.documentElement;

    const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    const clientTop = docEl.clientTop || body.clientTop || 0;
    const clientLeft = docEl.clientLeft || body.clientLeft || 0;

    const top = box.top + scrollTop - clientTop;
    const left = box.left + scrollLeft - clientLeft;

    return { top, left, width: box.width, height: box.height };
}

function relativeTime(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    const seconds = Math.floor(diff);
    const minutes = Math.floor(diff / 60);
    const hours = Math.floor(diff / 60 / 60);
    const days = Math.floor(diff / 60 / 60 / 24);
    if (seconds < 60) {
        return `${seconds} seconds ago`;
    }
    if (minutes < 60) {
        return `${minutes} minutes ago`;
    }
    if (hours < 24) {
        return `${hours} hours ago`;
    }
    if (days < 30) {
        return `${days} days ago`;
    }
    if (date.getFullYear() === now.getFullYear()) {
        return `${date.getDate()} ${months[date.getMonth()]}`;
    }
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function setRelativeTime() {
    document.querySelectorAll('relative-time').forEach(elem => {
        const dateStr = elem.getAttribute('datetime');
        elem.innerHTML = relativeTime(dateStr);
        elem.setAttribute('title', new Date(dateStr).toLocaleString());
    });
}

// 記事を表示する関数
function displayPosts(posts) {
    console.log('displayPosts called, posts:', posts.length);
    const postsActivityContainer = document.getElementById('posts-activity');
    console.log('postsActivityContainer:', postsActivityContainer);
    if (!postsActivityContainer) return;

    // コンテナをクリア
    postsActivityContainer.innerHTML = '';

    // 月ごとのキーを収集
    const ms = [];
    for (const post of posts) {
        const time = post.date.getFullYear().toString() + "-" + post.date.getMonth().toString();
        if (!ms.includes(time)) {
            ms.push(time);
        }
    }

    console.log('months:', ms);

    // 最初の2ヶ月分だけ表示し、残りはhiddenにする
    // 直近の月だけdetailsを開いた状態にする
    let count = 0;
    for (const time of ms) {
        const array = time.split("-");
        const node = document.createElement('div');
        node.innerHTML = monthly(array[0], Number(array[1]), posts, count === 0);
        if (count >= 2) {
            node.classList.add('hidden');
        }
        postsActivityContainer.appendChild(node);
        count++;
    }

    // 3ヶ月以上ある場合、Show more activityボタンを追加
    if (ms.length > 2) {
        const showMoreButton = document.createElement('div');
        showMoreButton.id = 'show-more-activity';
        showMoreButton.className = 'width-full pb-4';
        showMoreButton.style.cssText = 'clear: both;';
        showMoreButton.innerHTML = `
            <div class="mt-3">
                <button class="btn btn-outline width-full" onclick="showMoreActivity(this.closest('#show-more-activity'))">
                    Show more activity
                </button>
            </div>
        `;
        postsActivityContainer.appendChild(showMoreButton);
    }
}

function showMoreActivity(self) {
    const activities = document.querySelector('#posts-activity').childNodes;
    for (const item of activities) {
        if (item.classList) {
            item.classList.remove('hidden');
        }
    }
    self.classList.add('hidden');
}
