import ajaxService from './ajaxService'

export function inBrowser() {
    return typeof window != 'undefined';
}

export function tokenError(props) {
    let url = window.location.href
    let id = url.substr(url.lastIndexOf('/') + 1, url.length - 1)
    window.location.href = '/exam/login/' + (Number(id) === parseInt(id) ? id : '')
}

export function isLogin() {
    ajaxService.islogin()
}

export function getAllTime(time) {
    time = new Date(time)
    let y = time.getFullYear(), m = time.getMonth() + 1, d = time.getDate(), h = time.getHours(),
        mm = time.getMinutes(), s = time.getSeconds()
    m < 10 && (m = '0' + m)
    d < 10 && (d = '0' + d)
    h < 10 && (h = '0' + h)
    mm < 10 && (mm = '0' + mm)
    s < 10 && (s = '0' + s)
    return y + '-' + m + '-' + d + ' ' + h + ':' + mm + ':' + s
}

export function getExamStatus(start, finish) {
    let now = new Date()
    start = new Date(start)
    finish = new Date(finish)
    if (now < start) {
        return 'pending'
    } else if (now >= start && now < finish) {
        return 'starting'
    } else {
        return 'ending'
    }
}

export function getProgramScore(status) {
    let score = 0
    let trueNum = 0
    for (let i = 0; i < status.length; i++) {
        if (status[i].status === 1 || status[i].status === 6) {
            score += 10
            trueNum++
        }
    }
    return {
        trueNum:`${trueNum}/${status.length}`,
        score
    }
}

export function getProgramStatus(status) {
    let s = {
        className: 'queuing',
        content: 'Queuing'
    }
    switch (status) {
        case 0:
            s = {
                className: 'queuing',
                content: 'Queuing'
            }
            break
        case 1:
            s = {
                className: 'accepted',
                content: 'Accepted'
            }
            break
        case 2:
            s = {
                className: 'fail',
                content: 'Time Limit Exceeded'
            }
            break
        case 3:
            s = {
                className: 'fail',
                content: 'Memory Limit Exceeded'
            }
            break
        case 4:
            s = {
                className: 'fail',
                content: 'Runtime Error'
            }
            break
        case 5:
            s = {
                className: 'fail',
                content: 'Compile Error'
            }
            break
        case 6:
            s = {
                className: 'presentation',
                content: 'Presentation Error'
            }
            break
        case 7:
            s = {
                className: 'fail',
                content: 'Wrong Answer'
            }
            break
        default:
            s = {
                className: 'fail',
                content: 'Runtime Error'
            }
            break
    }
    return s
}
