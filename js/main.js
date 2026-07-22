// ===================== 可自定义建站时间（修改这里即可） =====================
// JS月份规则：0=1月、6=7月，格式：new Date(年,月索引,日,时,分,秒)
const BUILD_SITE_TIME = new Date(2026, 6, 5, 0, 0, 0);
// =========================================================================
// 天气图标SVG库
const weatherIcons = {
    sunny: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="5" fill="#FBBF24"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#FBBF24" stroke-width="2" stroke-linecap="round"/></svg>`,
    cloudy: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 16a3.5 3.5 0 0 0 0-7h-1.5a5.5 5.5 0 0 0-10.5 2A3 3 0 0 0 5 16h14z" fill="#9CA3AF"/></svg>`,
    rainy: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 13a4 4 0 1 0-6.5-3.2A3.5 3.5 0 0 0 5 12.5a3.5 3.5 0 0 0 3.5 3.5H16a3 3 0 0 0 0-6z" fill="#60A5FA"/><path d="M8 18v2M12 18v2M16 18v2" stroke="#3B82F6" stroke-width="2" stroke-linecap="round"/></svg>`,
    night: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#A855F7"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42" stroke="#A855F7" stroke-width="2" stroke-linecap="round"/></svg>`,
    overcast: `<svg viewBox="0 0 24 24" fill="#6B7280"><path d="M18 15a4 4 0 0 0-.8-7.9A6 6 0 0 0 6 11a3 3 0 0 0 0 6h12z"/></svg>`,
    thunder: `<svg viewBox="0 0 24 24" fill="none"><path d="M17 14a3.5 3.5 0 0 0 0-7h-1.2a5.3 5.3 0 0 0-9.3 2.2A3.2 3.2 0 0 0 4 14h13z" fill="#4B5563"/><path d="M13 16l-3 5h4l-1 4" stroke="#FBBF24" stroke-width="2" stroke-linecap="round"/></svg>`,
    snow: `<svg viewBox="0 0 24 24" fill="none"><path d="M18 13a4 4 0 0 0-.6-7.8A5.5 5.5 0 0 0 7 10a3 3 0 0 0 0 6h11z" fill="#D1D5DB"/><circle cx="8" cy="19" r="1.5" fill="#fff"/><circle cx="12" cy="20" r="1.5" fill="#fff"/><circle cx="16" cy="19" r="1.5" fill="#fff"/></svg>`
};
// 星期数组
const weekList = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];

document.addEventListener("DOMContentLoaded", function(){
    // 1. 实时时间+日期渲染
    function refreshTimeDate() {
        const now = new Date();
        let h = String(now.getHours()).padStart(2,"0");
        let m = String(now.getMinutes()).padStart(2,"0");
        let s = String(now.getSeconds()).padStart(2,"0");
        document.getElementById("time").textContent = `${h}:${m}:${s}`;
        let y = now.getFullYear();
        let mon = String(now.getMonth()+1).padStart(2,"0");
        let d = String(now.getDate()).padStart(2,"0");
        let week = weekList[now.getDay()];
        document.getElementById("dateInfo").textContent = `${y}年${mon}月${d}日 ${week}`;
    }
    refreshTimeDate();
    setInterval(refreshTimeDate, 1000);

    // 2. 建站运行时长（基于自定义BUILD_SITE_TIME）
    function calcBuildRunTime() {
        const now = Date.now();
        const buildTs = BUILD_SITE_TIME.getTime();
        const diff = now - buildTs;
        if(diff <= 0) {
            document.getElementById("runTime").textContent = "建站时间未到";
            return;
        }
        const day = Math.floor(diff / (1000*60*60*24));
        const hour = Math.floor((diff / (1000*60*60)) %24);
        const min = Math.floor((diff / (1000*60)) %60);
        const sec = Math.floor((diff / 1000) %60);
        document.getElementById("runTime").textContent = `${day}天${hour}时${min}分${sec}秒`;
    }
    calcBuildRunTime();
    setInterval(calcBuildRunTime, 1000);

    // 3. IP定位 + open-meteo免费天气（国内稳定IP接口）
    async function getIpWeather() {
        let lat = 22.03;
        let lon = 111.96;
        let cityName = "广东阳江";
        // 国内IP定位接口，替代不稳定ipapi.co
        try {
            const ipRes = await fetch("https://api.ip.sb/jsonip", {signal: AbortSignal.timeout(3000)});
            const ipData = await ipRes.json();
            const region = ipData.region || "";
            const city = ipData.city || "阳江";
            cityName = `${region} ${city}`;
            lat = Number(ipData.latitude) || lat;
            lon = Number(ipData.longitude) || lon;
        } catch (e) {
            console.log("IP定位失败，使用默认阳江坐标");
        }

        try {
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`, {signal: AbortSignal.timeout(4000)});
            const weatherJson = await weatherRes.json();
            const now = weatherJson.current;
            const temp = now.temperature_2m;
            const code = now.weather_code;
            const hour = new Date().getHours();
            let iconKey = "cloudy";

            // 天气代码匹配图标
            if(code >= 0 && code <=3) iconKey = "sunny";
            if(code >=45 && code <=48) iconKey = "overcast";
            if(code >=51 && code <=67) iconKey = "rainy";
            if(code >=71 && code <=77) iconKey = "snow";
            if(code >=80 && code <=99) iconKey = "thunder";
            // 18点后、6点前强制夜间月亮图标
            if(hour <6 || hour >=18) iconKey = "night";

            // 完善中文天气描述库
            const descMap = {
                0:"晴朗",1:"大部晴朗",2:"多云",3:"阴天",
                45:"雾",48:"霜雾",
                51:"小雨",53:"小雨",55:"大雨",
                61:"小雨",63:"中雨",65:"大雨",
                71:"小雪",73:"中雪",75:"大雪",
                95:"雷阵雨",96:"雷暴伴冰雹",99:"强雷暴冰雹"
            };
            const desc = descMap[code] || "多云";

            document.getElementById("cityName").textContent = cityName;
            document.getElementById("weatherIcon").innerHTML = weatherIcons[iconKey];
            document.getElementById("temperature").textContent = `${temp}℃`;
            document.getElementById("weatherDesc").textContent = desc;
        } catch (err) {
            console.error("天气接口获取失败：", err);
            document.getElementById("cityName").textContent = "广东阳江";
            document.getElementById("temperature").textContent = "--℃";
            document.getElementById("weatherDesc").textContent = "天气加载失败";
            document.getElementById("weatherIcon").innerHTML = weatherIcons.night;
        }
    }
    getIpWeather();
    setInterval(getIpWeather, 600000); // 刷新一次天气

    // 4. 明暗模式切换
    const toggleWrap = document.getElementById("modeToggle");
    const toggleBall = document.getElementById("toggleCircle");
    const bodyDom = document.body;
    let darkStatus = localStorage.getItem("nav-dark");
    const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let isDark = darkStatus ? darkStatus === "dark" : sysDark;

    function updateThemeUI() {
        if(isDark) {
            bodyDom.classList.remove("light-mode");
            bodyDom.classList.add("dark-mode");
            toggleBall.classList.add("moon");
        } else {
            bodyDom.classList.remove("dark-mode");
            bodyDom.classList.add("light-mode");
            toggleBall.classList.remove("moon");
        }
    }
    updateThemeUI();
    toggleWrap.onclick = function(e) {
        e.stopPropagation();
        isDark = !isDark;
        updateThemeUI();
        localStorage.setItem("nav-dark", isDark ? "dark" : "light");
    };
    if(window.matchMedia) {
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ev => {
            if(!localStorage.getItem("nav-dark")) {
                isDark = ev.matches;
                updateThemeUI();
            }
        })
    }
})