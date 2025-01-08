// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 设置Bing背景图片
    setBingBackground();
    
    // 阅读量统计
    const viewCount = document.getElementById('viewCount');
    let views = localStorage.getItem('articleViews') || 0;
    views = parseInt(views) + 1;
    localStorage.setItem('articleViews', views);
    viewCount.textContent = views;

    // 添加代码块复制功能
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(codeBlock => {
        const container = document.createElement('div');
        container.classList.add('code-container');
        
        const copyButton = document.createElement('button');
        copyButton.classList.add('copy-button');
        copyButton.textContent = '复制代码';
        
        copyButton.addEventListener('click', function() {
            const text = codeBlock.textContent;
            navigator.clipboard.writeText(text)
                .then(() => {
                    copyButton.textContent = '已复制!';
                    setTimeout(() => {
                        copyButton.textContent = '复制代码';
                    }, 2000);
                })
                .catch(err => {
                    console.error('复制失败:', err);
                });
        });

        codeBlock.parentNode.insertBefore(container, codeBlock);
        container.appendChild(codeBlock);
        container.appendChild(copyButton);
    });

    // 生成目录导航
    const headings = document.querySelectorAll('.content h2');
    if (headings.length > 0) {
        const toc = document.createElement('div');
        toc.classList.add('toc');
        
        const tocTitle = document.createElement('h3');
        tocTitle.textContent = '目录';
        toc.appendChild(tocTitle);
        
        const tocList = document.createElement('ul');
        headings.forEach(heading => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.textContent = heading.textContent;
            link.href = `#${heading.id}`;
            listItem.appendChild(link);
            tocList.appendChild(listItem);
        });
        toc.appendChild(tocList);
        
        document.querySelector('.sidebar').insertBefore(toc, document.querySelector('.sidebar').firstChild);
    }

    // 文章阅读进度
    const progressBar = document.createElement('div');
    progressBar.classList.add('progress-bar');
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
        const articleHeight = document.querySelector('.article-content').offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollTop = window.scrollY;
        const progress = (scrollTop / (articleHeight - windowHeight)) * 100;
        progressBar.style.width = `${progress}%`;
    });

    // 评论功能
    const commentForm = document.querySelector('.comment-form');
    const commentList = document.querySelector('.comment-list');
    const commentTextarea = document.querySelector('.comment-form textarea');
    const charCount = document.querySelector('.char-count');
    const submitBtn = document.querySelector('.comment-form .submit-btn');

    // 评论字数统计
    if (commentTextarea) {
        commentTextarea.addEventListener('input', function() {
            const length = this.value.length;
            charCount.textContent = `${length}/500`;
            charCount.style.color = length >= 500 ? 'red' : '#666';
        });
    }

    // 从localStorage加载评论
    function loadComments() {
        const comments = JSON.parse(localStorage.getItem('comments') || '[]');
        commentList.innerHTML = '';
        comments.forEach(comment => {
            addCommentToDOM(comment);
        });
    }

    // 添加评论到DOM
    function addCommentToDOM(comment) {
        const commentItem = document.createElement('div');
        commentItem.classList.add('comment-item');
        commentItem.dataset.id = comment.id;

        const avatar = document.createElement('img');
        avatar.classList.add('comment-avatar');
        avatar.src = 'images/avatar.webp';
        avatar.alt = '用户头像';

        const content = document.createElement('div');
        content.classList.add('comment-content');

        const header = document.createElement('div');
        header.classList.add('comment-header');

        const author = document.createElement('span');
        author.classList.add('comment-author');
        author.textContent = comment.author || '匿名用户';

        const date = document.createElement('span');
        date.classList.add('comment-date');
        date.textContent = formatDate(comment.date);
        date.setAttribute('data-timestamp', new Date(comment.date).getTime());

        const text = document.createElement('div');
        text.classList.add('comment-text');
        text.textContent = comment.text;

        const actions = document.createElement('div');
        actions.classList.add('comment-actions');

        const likeBtn = document.createElement('button');
        likeBtn.classList.add('like-btn');
        likeBtn.title = '点赞';
        likeBtn.innerHTML = `<i class="far fa-thumbs-up"></i> <span class="like-count">${comment.likes || 0}</span>`;

        const replyBtn = document.createElement('button');
        replyBtn.classList.add('reply-btn');
        replyBtn.title = '回复';
        replyBtn.textContent = '回复';

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.title = '删除';
        deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;

        // 点赞功能
        likeBtn.addEventListener('click', function() {
            let likes = parseInt(comment.likes) || 0;
            likes++;
            comment.likes = likes;
            this.querySelector('.like-count').textContent = likes;
            saveComments();
        });

        // 回复功能
        replyBtn.addEventListener('click', function() {
            // 检查是否已经存在回复表单
            if (commentItem.querySelector('.reply-form')) {
                return;
            }
            
            const replyForm = createReplyForm(comment.id);
            const repliesContainer = commentItem.querySelector('.comment-replies') || 
                document.createElement('div');
            repliesContainer.classList.add('comment-replies');
            repliesContainer.appendChild(replyForm);
            commentItem.appendChild(repliesContainer);
            
            // 滚动到回复表单
            replyForm.scrollIntoView({behavior: 'smooth', block: 'start'});
        });

        // 删除功能
        deleteBtn.addEventListener('click', function() {
            if (confirm('确定要删除这条评论吗？')) {
                const comments = JSON.parse(localStorage.getItem('comments') || '[]');
                const updatedComments = comments.filter(c => c.id !== comment.id);
                localStorage.setItem('comments', JSON.stringify(updatedComments));
                commentItem.remove();
            }
        });

        actions.appendChild(likeBtn);
        actions.appendChild(replyBtn);
        actions.appendChild(deleteBtn);

        header.appendChild(author);
        header.appendChild(date);
        content.appendChild(header);
        content.appendChild(text);
        content.appendChild(actions);
        commentItem.appendChild(avatar);
        commentItem.appendChild(content);
        commentList.appendChild(commentItem);
    }

    // 创建回复表单
    function createReplyForm(parentId) {
        const form = document.createElement('div');
        form.classList.add('reply-form');

        const textarea = document.createElement('textarea');
        textarea.placeholder = '写下你的回复...';
        textarea.maxLength = 300;

        const footer = document.createElement('div');
        footer.classList.add('form-footer');

        const charCount = document.createElement('span');
        charCount.classList.add('char-count');
        charCount.textContent = '0/300';

        const submitBtn = document.createElement('button');
        submitBtn.classList.add('submit-btn');
        submitBtn.textContent = '提交回复';

        textarea.addEventListener('input', function() {
            const length = this.value.length;
            charCount.textContent = `${length}/300`;
            charCount.style.color = length >= 300 ? 'red' : '#666';
        });

        submitBtn.addEventListener('click', function() {
            const text = textarea.value.trim();
            if (text.length < 5) {
                alert('回复内容至少需要5个字符');
                return;
            }

            const reply = {
                id: Date.now(),
                parentId: parentId,
                text: text,
                date: new Date().toISOString(),
                author: '匿名用户',
                likes: 0
            };

            saveReply(reply);
            textarea.value = '';
            charCount.textContent = '0/300';
        });

        footer.appendChild(charCount);
        footer.appendChild(submitBtn);
        form.appendChild(textarea);
        form.appendChild(footer);

        return form;
    }

    // 保存评论
    function saveComments() {
        const comments = Array.from(document.querySelectorAll('.comment-item')).map(item => {
            return {
                id: item.dataset.id,
                text: item.querySelector('.comment-text').textContent,
                date: item.querySelector('.comment-date').dataset.timestamp,
                author: item.querySelector('.comment-author').textContent,
                likes: parseInt(item.querySelector('.like-count').textContent)
            };
        });
        localStorage.setItem('comments', JSON.stringify(comments));
    }

    // 保存回复
    function saveReply(reply) {
        const comments = JSON.parse(localStorage.getItem('comments') || '[]');
        comments.push(reply);
        localStorage.setItem('comments', JSON.stringify(comments));
        loadComments();
    }

    // 格式化日期
    function formatDate(date) {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;

        // 1分钟内显示"刚刚"
        if (diff < 60000) {
            return '刚刚';
        }

        // 1小时内显示"x分钟前"
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}分钟前`;
        }

        // 24小时内显示"x小时前"
        if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)}小时前`;
        }

        // 超过24小时显示完整日期
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    function pad(num) {
        return num < 10 ? `0${num}` : num;
    }

    // 提交评论
    if (commentForm) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const text = commentTextarea.value.trim();
            if (text.length < 5) {
                alert('评论内容至少需要5个字符');
                return;
            }
            if (text.length > 500) {
                alert('评论内容不能超过500个字符');
                return;
            }

            const comment = {
                id: Date.now(),
                text: text,
                date: new Date().toISOString(),
                author: '匿名用户',
                likes: 0
            };

            // 保存到localStorage
            let comments = JSON.parse(localStorage.getItem('comments'));
            if (!comments) {
                comments = [];
            }
            comments.push(comment);
            try {
                localStorage.setItem('comments', JSON.stringify(comments));
                // 重新加载评论
                loadComments();
            } catch (error) {
                console.error('保存评论失败:', error);
                alert('评论保存失败，请稍后再试');
            }

            // 清空输入框
            commentTextarea.value = '';
            charCount.textContent = '0/500';
            
            // 滚动到新评论
            const newComment = commentList.lastElementChild;
            newComment.scrollIntoView({behavior: 'smooth'});
        });
    }

    // 删除评论功能
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-btn')) {
            const commentId = e.target.closest('.comment-item').dataset.id;
            const comments = JSON.parse(localStorage.getItem('comments') || '[]');
            const updatedComments = comments.filter(c => c.id !== commentId);
            localStorage.setItem('comments', JSON.stringify(updatedComments));
            loadComments();
        }
    });

    // 分页功能
    const commentsPerPage = 5;
    let currentPage = 1;

    function paginateComments(comments) {
        const start = (currentPage - 1) * commentsPerPage;
        const end = start + commentsPerPage;
        return comments.slice(start, end);
    }

    function updatePagination(comments) {
        const totalPages = Math.ceil(comments.length / commentsPerPage);
        const pagination = document.createElement('div');
        pagination.classList.add('pagination');
        
        if (currentPage > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.textContent = '上一页';
            prevBtn.addEventListener('click', () => {
                currentPage--;
                loadComments();
            });
            pagination.appendChild(prevBtn);
        }

        if (currentPage < totalPages) {
            const nextBtn = document.createElement('button');
            nextBtn.textContent = '下一页';
            nextBtn.addEventListener('click', () => {
                currentPage++;
                loadComments();
            });
            pagination.appendChild(nextBtn);
        }

        commentList.parentNode.insertBefore(pagination, commentList.nextSibling);
    }

    // 修改loadComments函数
    function loadComments() {
        const comments = JSON.parse(localStorage.getItem('comments') || '[]');
        const paginatedComments = paginateComments(comments);
        
        commentList.innerHTML = '';
        paginatedComments.forEach(comment => {
            addCommentToDOM(comment);
        });

        updatePagination(comments);
    }

    // 确保评论列表元素存在后再初始化
    if (commentList) {
        loadComments();
    } else {
        console.error('评论列表元素未找到');
    }
});

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
