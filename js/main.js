// 获取一言
async function getHitokoto() {
    try {
        const response = await fetch('https://v1.hitokoto.cn/');
        const data = await response.json();
        return {
            content: data.hitokoto,
            from: data.from || '未知'
        };
    } catch (error) {
        console.error('获取一言失败:', error);
        return {
            content: data.hitokoto,
            from: data.from
        };
    }
}

// 更新一言显示
function updateHitokoto() {
    const hitokotoElement = document.querySelector('.hitokoto-content');
    const fromElement = document.querySelector('.hitokoto-from');
    
    if (!hitokotoElement || !fromElement) return;

    // 显示加载状态
    hitokotoElement.textContent = '正在加载一言...';
    fromElement.textContent = '';

    getHitokoto().then(data => {
        hitokotoElement.textContent = data.content;
        fromElement.textContent = `—— ${data.from}`;
    });
}

// 设置Bing每日一图背景
function setBingBackground() {
    const header = document.getElementById('bing-header');
    if (header) {
        fetch('https://bing.biturl.top/')
            .then(response => response.json())
            .then(data => {
                header.style.backgroundImage = `url(${data.url})`;
                header.style.backgroundSize = 'cover';
                header.style.backgroundPosition = 'center';
            })
            .catch(error => {
                console.error('获取Bing每日一图失败:', error);
                header.style.backgroundColor = '#333'; // 失败时使用默认背景色
            });
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    setBingBackground();
    // 初始化一言
    updateHitokoto();
    // 更新文章阅读量
    const updateViews = () => {
        try {
            const articleViews = localStorage.getItem('article-views') || '{}';
            const viewsData = JSON.parse(articleViews);
            
            // 更新杂谈页面阅读量
            const viewsArticle = document.getElementById('views-article');
            if (viewsArticle) {
                const articleId = window.location.pathname.includes('article.html') ? 'article' : 'article2';
                viewsArticle.textContent = viewsData[articleId] || 0;
            }
            
            // 更新编程页面阅读量
            const viewsArticle2 = document.getElementById('views-article2');
            if (viewsArticle2) {
                const articleId = window.location.pathname.includes('article.html') ? 'article' : 'article2';
                viewsArticle2.textContent = viewsData[articleId] || 0;
            }
        } catch (error) {
            console.error('更新阅读量时出错:', error);
        }
    };
    
    // 初始化时更新阅读量
    updateViews();
    
    // 窗口大小改变时检查导航栏状态
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            nav.classList.remove('active');
        }
    });

    // 文章卡片交互效果
    const articles = document.querySelectorAll('.featured-articles article');
    articles.forEach(article => {
        article.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
        });

        article.addEventListener('click', function() {
            const link = this.querySelector('a');
            if (link) {
                window.location.href = link.href;
            }
        });
    });

    // 页面滚动效果
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 初始化页面状态
    initPage();
});

function initPage() {
    // 设置当前年份
    const yearElement = document.querySelector('footer p');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.textContent = yearElement.textContent.replace('2023', currentYear);
    }

    // 初始化归档页面功能
    initArchive();
}

function initArchive() {
    const yearSections = document.querySelectorAll('.year-section');
    
    yearSections.forEach(section => {
        const toggleBtn = section.querySelector('.toggle-btn');
        const monthList = section.querySelector('.month-list');
        
        // 默认展开
        monthList.style.display = 'block';
        toggleBtn.classList.remove('collapsed');
        
        toggleBtn.addEventListener('click', function() {
            const isCollapsed = monthList.style.display === 'none';
            monthList.style.display = isCollapsed ? 'block' : 'none';
            toggleBtn.classList.toggle('collapsed', !isCollapsed);
        });
    });
}
