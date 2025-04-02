AV.init({
    appId: 'QU45ROFg7APkwwqxdMQyxPWo-MdYXbMMI',
    appKey: 'AgT49FMfinwixlLxeu3dXBHx'
})

function showOverlay () {
    const overlay = document.getElementById('submissionOverlay')
    overlay.style.display = 'block'
    overlay.addEventListener('click', () => {
        overlay.style.display = 'none'
    }, { once: true })
}


const Comment = AV.Object.extend('Comments')

document.getElementById('submitComment').addEventListener('click', function () {
    const commentText = document.getElementById('commentInput').value.trim()
    if (!commentText) {
        alert("Please enter a comment.")
        return
    }
    const comment = new Comment()
    comment.set('comment', commentText)
    comment.set('like', 0)
    comment.save().then(function (savedComment) {
        console.log('Comment saved successfully', savedComment)
        document.getElementById('commentInput').value = ''
        showOverlay()
        loadComments()
    }).catch(function (error) {
        console.error('Failed to save comment', error)
    })
})

function loadComments () {
    const query = new AV.Query('Comments')
    query.find().then(function (results) {

        results.sort(function (a, b) {
            return (b.get('like') - a.get('like'))
        })

        const commentList = document.getElementById('commentList')
        commentList.innerHTML = ''

        results.forEach(function (item) {
            const commentText = item.get('comment')
            const likeCount = item.get('like')
            const commentId = item.id

            const { backgroundColor, opacity } = getHearthstoneColor(likeCount)

            const div = document.createElement('div')
            div.className = 'card mb-2'
            div.style.backgroundColor = backgroundColor
            div.style.opacity = opacity
            div.innerHTML = `
                <div class="card-body">
                    <p class="card-text" style="font-size: 1.5rem">${commentText}</p>
                    <div>
                        <button class="btn btn-sm btn-outline-danger me-2" onclick="likeComment('${commentId}')">He is SOOOO Silly!</button>
                        <button class="btn btn-sm btn-outline-dark" onclick="dislikeComment('${commentId}')">Not THAT Silly~</button>            
                    </div>
                </div>
            `
            commentList.appendChild(div)
        })
    }).catch(function (error) {
        console.error('Failed to load comments', error)
    })
}

function getHearthstoneColor (score) {
    if (score < 0) {
        const opacity = Math.max(0.2, 1 + score / 100) // score -100 → 0.2, score 0 → 1
        return { backgroundColor: '#ffffff', opacity }
    }

    if (score >= 75) {
        return { backgroundColor: 'rgba(220, 53, 69, 0.3)' }      // red (legendary)
    } else if (score >= 50) {
        return { backgroundColor: 'rgba(255, 193, 7, 0.3)' }       // gold (epic)
    } else if (score >= 25) {
        return { backgroundColor: 'rgba(111, 66, 193, 0.3)' }      // purple (rare)
    } else if (score >= 1) {
        return { backgroundColor: 'rgba(0, 123, 255, 0.3)' }       // blue (uncommon)
    } else {
        return { backgroundColor: 'rgba(255, 255, 255, 0.3)' }     // white (common)
    }
}



function likeComment (commentId) {
    const query = new AV.Query('Comments')
    query.get(commentId).then(function (comment) {
        comment.increment('like', 1)
        return comment.save()
    }).then(function (updatedComment) {
        loadComments()
    }).catch(function (error) {
        console.error('Failed to like comment', error)
    })
}

function dislikeComment (commentId) {
    const query = new AV.Query('Comments')
    query.get(commentId).then(function (comment) {
        comment.increment('like', -1)
        return comment.save()
    }).then(function (updatedComment) {
        loadComments()
    }).catch(function (error) {
        console.error('Failed to dislike comment', error)
    })
}

window.addEventListener('load', loadComments)
