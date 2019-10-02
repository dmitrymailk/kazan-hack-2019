// import React from "react";
import logo from "./logo.svg";
// import "./App.css";
import "./style.css";
import React, { Component } from "react";
import axios from "axios";
let refresh = require("./refresh.png");
let popup = require("./img/popup.png");
let question = require("./img/question.png");
var ymaps = window.ymaps;

let arrow = require("./img/arrow.png");

let trainW = require("./img/Vector (1).png"),
  trainB = require("./img/Vector (2).png"),
  carB = require("./img/Vector (3).png"),
  carW = require("./img/Vector (4).png");
const operators = [
  {
    name: "Beeline",
    img:
      "https://is5-ssl.mzstatic.com/image/thumb/Purple123/v4/5a/27/3d/5a273dff-8ff8-2833-348e-cf3b496898e1/AppIcon-0-1x_U007emarketing-0-0-GLES2_U002c0-512MB-sRGB-0-0-0-85-220-0-0-0-7.png/230x0w.jpg",
    id: 0
  },
  {
    name: "Tele2",
    img:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Tele2_logo.svg/533px-Tele2_logo.svg.png",
    id: 1
  }
];

const tabs = [
  {
    id: 2,
    name: "2G"
  },
  {
    id: 3,
    name: "3G"
  },
  {
    id: 4,
    name: "4G"
  },
  {
    id: 5,
    name: "Все"
  }
];

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      openOperators: false,
      currentOperator: 1,
      openSearchRoute: false,
      map: null,
      points: [],
      openSearchRouteControls: false,
      activeTab: 5,
      currentDots: [],
      currentTransportType: false
    };
  }

  searchRoute = () => {
    let { openSearchRoute } = this.state;
    let searchInfo = document.querySelector(".route-info");

    if (!openSearchRoute) {
      searchInfo.style.display = "flex";
      this.setState({
        openSearchRoute: !openSearchRoute
      });
    } else {
      searchInfo.style.display = "none";
      this.setState({
        openSearchRoute: !openSearchRoute
      });
    }

    axios
      .post("https://work-minimum.herokuapp.com/api/values/roadLine", {
        nameFrom: this.state.firstInput,
        nameTo: this.state.secondInput
      })
      .then(res => {
        let arr = res.data;
        this.drawRoute(arr);
        console.log("ROUTED DRAWED");
      });
  };

  colorPoints = value => {
    if (value >= 0 && value <= 1) {
      return "#F24242";
    } else if (value >= 2 && value <= 7) {
      return "#E3F04E";
    } else if (value >= 8) {
      return "#67E22D";
    } else if (value == -10) {
      return "#ff32ff";
    }
  };

  updateMap = async () => {
    if (window.myMap) {
      let { currentDots } = this.state;
      let points = currentDots;
      window.myMap.geoObjects.removeAll();
      console.log("UPDATE");
      for (let i = 0; i < points.length; i++) {
        let x = points[i].X;
        let y = points[i].Y;

        console.log(i, x, y);
        let myCircle = await new ymaps.Circle(
          [[x, y], 5],
          {
            balloonContent: `Signal level - ${points[i].level}\nOperator - ${points[i].nameOperator} x - ${x} y - ${y}`,
            hintContent: "Click me"
          },
          {
            fillColor: this.colorPoints(points[i].level),
            outline: false,
            zIndex: 1000
          }
        );
        await window.myMap.geoObjects.add(myCircle);
      }
      if (
        (this.state.activeTab == 4 || this.state.activeTab == 5) &&
        !this.state.currentTransportType &&
        this.state.currentOperator == 0
      ) {
        let myRectangle = new ymaps.Rectangle(
          [
            // Задаем координаты диагональных углов прямоугольника.
            [55.810818, 49.063931],
            [55.788959, 49.103135]
          ],
          {
            //Свойства
            hintContent: "Зона покрытия 4G Билайн",
            balloonContent: "Зона покрытия 4G Билайн"
          },
          {
            // Опции.
            // Цвет и прозрачность заливки.
            fillColor: "#fbba8c",
            // Дополнительная прозрачность заливки..
            // Итоговая прозрачность будет не #33(0.2), а 0.1(0.2*0.5).
            fillOpacity: 0.3,
            // Цвет обводки.
            strokeColor: "#0000FF",
            // Прозрачность обводки.
            strokeOpacity: 0.001,
            // Ширина линии.
            strokeWidth: 2,
            // Радиус скругления углов.
            // Данная опция принимается только прямоугольником.
            borderRadius: 6
          }
        );
        window.myMap.geoObjects.add(myRectangle);
      }
      // await this.setState({
      //   currentDots: this.state.points
      // });
    }
  };

  async componentDidMount() {
    let points = await axios.get(
      "https://work-minimum.herokuapp.com/api/values/all"
    );
    console.log(points, "POINTS");
    await this.setState({
      points: points.data
    });
    await this.changeOperator(1);
    this.createCircle();
    await this.setState({
      currentDots: this.state.points
    });
  }

  changeOperator = async id => {
    if (!this.state.currentTransportType) {
      let { points } = this.state;
      let newDots = await points.filter(
        item => id !== this.operator(item.nameOperator)
      );
      await this.setState({
        currentOperator: id,
        currentDots: newDots,
        operatorDots: newDots
      });
      await this.updateMap();
    } else {
      await this.setState({
        currentOperator: id
      });
    }
  };

  operator = name => {
    switch (name) {
      case "Tele2":
        return 0;
      case "Beeline":
        return 1;
    }
  };

  createCircle = () => {
    ymaps.ready(init);
    let { currentDots } = this.state;
    let colorPoints = this.colorPoints;
    async function init() {
      // Creating the map.  55.797735490000136 y - 49.079449399999696
      let myMap = new ymaps.Map("map", {
        center: [55.797735490000136, 49.079449399999696],
        zoom: 15,
        controls: []
      });

      window.myMap = myMap;
      myMap = window.myMap;

      let points = currentDots;
      console.log(points);
      for (let i = 0; i < points.length; i++) {
        let x = points[i].X;
        let y = points[i].Y;

        var myCircle = await new ymaps.Circle(
          [[x, y], 5],
          {
            balloonContent: `Signal level - ${points[i].level}\nOperator - ${points[i].nameOperator} x - ${x} y - ${y}`,
            hintContent: "Click me"
          },
          {
            draggable: false,
            fillColor: colorPoints(points[i].level),
            outline: false,
            zIndex: 1000
          }
        );
        await myMap.geoObjects.add(myCircle);
        console.log("object");
      }

      // Adding the mySearchControl to the map.

      let mySearchControl = new ymaps.control.SearchControl({
        options: {
          noPlacemark: true
        }
      });

      // The search results will be placed in the collection.
      let mySearchResults = new ymaps.GeoObjectCollection(null, {
        hintContentLayout: ymaps.templateLayoutFactory.createClass(
          "$[properties.name]"
        )
      });
      myMap.controls.add(mySearchControl);
      myMap.geoObjects.add(mySearchResults);
      // When the found object is clicked, the placemark turns red.
      mySearchResults.events.add("click", function(e) {
        e.get("target").options.set("preset", "islands#redIcon");
      });
      // Putting the selected result in the collection.
      mySearchControl.events
        .add("resultselect", function(e) {
          var index = e.get("index");
          mySearchControl.getResult(index).then(function(res) {
            mySearchResults.add(res);
          });
        })
        .add("submit", function() {
          mySearchResults.removeAll();
        });

      // let myRectangle = new ymaps.Rectangle(
      //   [
      //     // Задаем координаты диагональных углов прямоугольника.
      //     [55.810818, 49.063931],
      //     [55.788959, 49.103135]
      //   ],
      //   {
      //     //Свойства
      //     hintContent: "Зона покрытия 4G Билайн",
      //     balloonContent: "Зона покрытия 4G Билайн"
      //   },
      //   {
      //     // Опции.
      //     // Цвет и прозрачность заливки.
      //     fillColor: "#fbba8c",
      //     // Дополнительная прозрачность заливки..
      //     // Итоговая прозрачность будет не #33(0.2), а 0.1(0.2*0.5).
      //     fillOpacity: 0.3,
      //     // Цвет обводки.
      //     strokeColor: "#0000FF",
      //     // Прозрачность обводки.
      //     strokeOpacity: 0.001,
      //     // Ширина линии.
      //     strokeWidth: 2,
      //     // Радиус скругления углов.
      //     // Данная опция принимается только прямоугольником.
      //     borderRadius: 6
      //   }
      // );
      // window.myMap.geoObjects.add(myRectangle);
    }
  };

  drawRoute = async array => {
    let newArr = [];
    for (let i = 0; i < array.length; i++) {
      let a = [array[i].X, array[i].Y];
      newArr.push(a);
    }
    let myPolyline = await new ymaps.Polyline(
      [
        // Указываем координаты вершин ломаной.
        ...newArr
      ],
      {
        // Описываем свойства геообъекта. Россия, Республика Татарстан, Лаишевский район, аэропорт Казань имени Габдуллы Тукая
        // Содержимое балуна.
        balloonContent: "Маршрут"
      },
      {
        // Задаем опции геообъекта.
        // Отключаем кнопку закрытия балуна.
        balloonCloseButton: false,
        // Цвет линии.
        strokeColor: "#2A28B9",
        // Ширина линии.
        strokeWidth: 10,
        // Коэффициент прозрачности.
        strokeOpacity: 1
      }
    );
    console.log(...array);

    // Добавляем линии на карту.
    await window.myMap.geoObjects.add(myPolyline);
    console.log("LINE DRAWED");
  };

  changeTypeConnection = async id => {
    let currentDots = this.state.operatorDots;
    this.setState({ activeTab: id });

    let newCurrentDots = [];
    if (5 == id && !this.state.currentTransportType) {
      newCurrentDots = this.state.operatorDots;
      this.setState({
        currentDots: newCurrentDots
      });
      await this.updateMap();
    } else {
      if (!this.state.currentTransportType) {
        await currentDots.forEach(item => {
          if (item.typeG && id <= item.typeG) {
            newCurrentDots.push(item);
          }
        });
        this.setState({
          currentDots: newCurrentDots
        });
      }
    }

    await this.updateMap();
  };

  changeTypeTransport = async value => {
    this.setState({
      currentTransportType: value
    });
    if (!value) {
      await this.setState({
        currentDots: this.state.points
      });
    } else {
      await this.setState({
        currentDots: []
      });
    }
    await this.updateMap();
  };

  openPopup = value => {
    let popup = document.querySelector(".popup-review");
    if (value) {
      popup.style.display = "flex";
    } else {
      popup.style.display = "none";
    }
  };
  render() {
    let {
      openOperators,
      currentOperator,
      openSearchRouteControls,
      currentTransportType
    } = this.state;
    return (
      <React.Fragment>
        <div id="map"></div>
        <div className="header">
          <svg
            width={159}
            height={38}
            viewBox="0 0 159 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M60.7262 23V19.3687H64.2613V18.6923H60.7262V15.6875H64.571V15H60V23H60.7262Z"
              fill="url(#paint0_linear)"
            />
            <path
              d="M79.4113 23V15H78.685V23H79.4113Z"
              fill="url(#paint1_linear)"
            />
            <path
              d="M94.5879 23V16.3139H94.6253L99.1589 23H99.8638V15H99.1429V21.6805H99.1055L94.5879 15H93.8671V23H94.5879Z"
              fill="url(#paint2_linear)"
            />
            <path
              d="M114.325 15V23H116.861C119.174 23 120.514 21.5308 120.514 18.9972C120.514 16.4692 119.168 15 116.861 15H114.325ZM115.057 15.6875H116.819C118.714 15.6875 119.772 16.8739 119.772 19.0028C119.772 21.1261 118.714 22.3125 116.819 22.3125H115.057V15.6875Z"
              fill="url(#paint3_linear)"
            />
            <path
              d="M139.306 22.3125H135.381V19.2412H139.108V18.5648H135.381V15.6875H139.306V15H134.655V23H139.306V22.3125Z"
              fill="url(#paint4_linear)"
            />
            <path
              d="M154.29 15.6764H156.234C157.355 15.6764 158.033 16.3028 158.033 17.3617C158.033 18.4317 157.377 19.0527 156.261 19.0527H154.29V15.6764ZM154.29 19.7235H156.261C156.298 19.7235 156.346 19.7235 156.378 19.7235L158.151 23H159L157.136 19.6015C158.167 19.3243 158.786 18.4705 158.786 17.3396C158.786 15.9148 157.825 15 156.319 15H153.564V23H154.29V19.7235Z"
              fill="url(#paint5_linear)"
            />
            <g clipPath="url(#clip0)">
              <path
                d="M21.3943 20.1776C21.3943 18.829 20.297 17.7324 18.9491 17.7324C17.6011 17.7324 16.5039 18.829 16.5039 20.1776C16.5039 21.5262 17.6011 22.6228 18.9491 22.6228C20.297 22.6228 21.3943 21.5262 21.3943 20.1776Z"
                fill="url(#paint6_linear)"
              />
              <path
                d="M25.0638 20.1774C25.0638 16.8066 22.3217 14.0645 18.9508 14.0645C15.58 14.0645 12.8379 16.8072 12.8379 20.1774C12.8379 22.3238 13.9921 24.339 15.8497 25.4388C16.4322 25.782 17.1812 25.5901 17.5244 25.0089C17.8682 24.4277 17.6757 23.6774 17.0951 23.3336C15.9776 22.6726 15.2831 21.4633 15.2831 20.1774C15.2831 18.1552 16.9286 16.5096 18.9508 16.5096C20.9731 16.5096 22.6186 18.1552 22.6186 20.1774C22.6186 21.4633 21.9241 22.6726 20.8066 23.3342C20.2254 23.678 20.0329 24.4277 20.3773 25.0089C20.6059 25.3945 21.013 25.6091 21.4309 25.6091C21.6423 25.6091 21.857 25.554 22.0526 25.4382C23.9096 24.339 25.0638 22.3231 25.0638 20.1774Z"
                fill="url(#paint7_linear)"
              />
              <path
                d="M18.9505 1.22656C8.50116 1.22656 0 9.72772 0 20.177C0 26.8503 3.57597 33.1064 9.33247 36.5044C9.91306 36.8482 10.664 36.6545 11.0065 36.0726C11.3497 35.4914 11.1565 34.7411 10.5753 34.398C5.56023 31.4381 2.44518 25.9886 2.44518 20.177C2.44518 11.0763 9.84974 3.67175 18.9505 3.67175C28.0512 3.67175 35.4558 11.0763 35.4558 20.177C35.4558 25.9886 32.3407 31.4381 27.325 34.398C26.7438 34.7411 26.5507 35.4908 26.8938 36.0726C27.1218 36.4588 27.5295 36.6735 27.948 36.6735C28.1589 36.6735 28.3735 36.619 28.5685 36.5038C34.325 33.1057 37.9016 26.8497 37.9016 20.1764C37.901 9.72772 29.3998 1.22656 18.9505 1.22656Z"
                fill="url(#paint8_linear)"
              />
              <path
                d="M33.6215 20.177C33.6215 12.0873 27.04 5.50586 18.9504 5.50586C10.8608 5.50586 4.2793 12.0873 4.2793 20.177C4.2793 25.3351 7.04865 30.1768 11.5059 32.8125C11.7016 32.9277 11.9156 32.9828 12.1271 32.9828C12.5449 32.9828 12.9527 32.7688 13.1806 32.382C13.5244 31.8014 13.3319 31.0511 12.7507 30.7073C9.03354 28.5097 6.72448 24.4747 6.72448 20.177C6.72448 13.4353 12.2094 7.95104 18.9504 7.95104C25.6914 7.95104 31.1763 13.4353 31.1763 20.177C31.1763 24.4747 28.8673 28.5103 25.1501 30.7073C24.5689 31.0511 24.3764 31.8008 24.7202 32.382C25.0646 32.9638 25.8136 33.1557 26.3948 32.8125C30.8521 30.1768 33.6215 25.3351 33.6215 20.177Z"
                fill="url(#paint9_linear)"
              />
              <path
                d="M29.3413 20.1775C29.3413 14.447 24.6795 9.78516 18.949 9.78516C13.2184 9.78516 8.55664 14.447 8.55664 20.1775C8.55664 23.825 10.5194 27.2522 13.6787 29.1206C14.2593 29.4637 15.0102 29.2719 15.3534 28.6907C15.6972 28.1095 15.5047 27.3592 14.9235 27.0154C12.5043 25.5851 11.0018 22.9646 11.0018 20.1769C11.0018 15.7949 14.5664 12.2297 18.949 12.2297C23.3316 12.2297 26.8961 15.7949 26.8961 20.1769C26.8961 22.9639 25.3931 25.5851 22.9745 27.0154C22.3933 27.3592 22.2008 28.1088 22.5446 28.6907C22.7731 29.0763 23.1803 29.2909 23.5981 29.2909C23.8096 29.2909 24.0242 29.2358 24.2192 29.1206C27.3786 27.2516 29.3413 23.825 29.3413 20.1775Z"
                fill="url(#paint10_linear)"
              />
            </g>
            <defs>
              <linearGradient
                id="paint0_linear"
                x1={60}
                y1={19}
                x2={159}
                y2={19}
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2A28B9" />
                <stop offset={1} stopColor="#1B1666" />
              </linearGradient>
              <linearGradient
                id="paint1_linear"
                x1={60}
                y1={19}
                x2={159}
                y2={19}
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2A28B9" />
                <stop offset={1} stopColor="#1B1666" />
              </linearGradient>
              <linearGradient
                id="paint2_linear"
                x1={60}
                y1={19}
                x2={159}
                y2={19}
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2A28B9" />
                <stop offset={1} stopColor="#1B1666" />
              </linearGradient>
              <linearGradient
                id="paint3_linear"
                x1={60}
                y1={19}
                x2={159}
                y2={19}
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2A28B9" />
                <stop offset={1} stopColor="#1B1666" />
              </linearGradient>
              <linearGradient
                id="paint4_linear"
                x1={60}
                y1={19}
                x2={159}
                y2={19}
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2A28B9" />
                <stop offset={1} stopColor="#1B1666" />
              </linearGradient>
              <linearGradient
                id="paint5_linear"
                x1={60}
                y1={19}
                x2={159}
                y2={19}
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2A28B9" />
                <stop offset={1} stopColor="#1B1666" />
              </linearGradient>
              <linearGradient
                id="paint6_linear"
                x1="16.5039"
                y1="20.1776"
                x2="21.3943"
                y2="20.1776"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2A28B9" />
                <stop offset={1} stopColor="#1B1666" />
              </linearGradient>
              <linearGradient
                id="paint7_linear"
                x1="12.8379"
                y1="19.8368"
                x2="25.0638"
                y2="19.8368"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2A28B9" />
                <stop offset={1} stopColor="#1B1666" />
              </linearGradient>
              <linearGradient
                id="paint8_linear"
                x1={0}
                y1="18.9506"
                x2="37.9016"
                y2="18.9506"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2A28B9" />
                <stop offset={1} stopColor="#1B1666" />
              </linearGradient>
              <linearGradient
                id="paint9_linear"
                x1="4.2793"
                y1="19.2443"
                x2="33.6215"
                y2="19.2443"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2A28B9" />
                <stop offset={1} stopColor="#1B1666" />
              </linearGradient>
              <linearGradient
                id="paint10_linear"
                x1="8.55664"
                y1="19.538"
                x2="29.3413"
                y2="19.538"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2A28B9" />
                <stop offset={1} stopColor="#1B1666" />
              </linearGradient>
              <clipPath id="clip0">
                <rect width="37.901" height="37.901" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>

        <div className="change-operator">
          {
            <div className="change-operator__operator">
              <div className="change-operator__logo">
                <img
                  src={operators[currentOperator].img}
                  alt=""
                  width="20"
                  height="auto"
                />
              </div>
              <div className="change-operator__name">
                {operators[currentOperator].name}
              </div>
            </div>
          }

          <div className="change-operator__list">
            {openOperators
              ? operators.map((item, i) => {
                  return (
                    <div
                      className="change-operator__operator"
                      key={i}
                      onClick={this.changeOperator.bind(this, item.id)}
                    >
                      <div className="change-operator__logo">
                        <img src={item.img} alt="" width="20" height="auto" />
                      </div>
                      <div className="change-operator__name">{item.name}</div>
                    </div>
                  );
                })
              : ""}
          </div>

          <div
            className="change-operator__arrow"
            onClick={() =>
              this.setState({ openOperators: !this.state.openOperators })
            }
          >
            <svg
              width={18}
              height={11}
              viewBox="0 0 18 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M1 1L9 9L17 1" stroke="white" strokeWidth={2} />
            </svg>
          </div>
        </div>

        <div
          className="available-connection"
          style={openOperators ? { display: "none" } : { display: "flex" }}
        >
          {tabs.map(item => {
            let { activeTab } = this.state;
            let active = "";
            if (activeTab == item.id)
              active = "available-connection__item_active";
            return (
              <div
                className={`available-connection__item ${active}`}
                onClick={this.changeTypeConnection.bind(this, item.id)}
                key={item.id}
              >
                {item.name}
              </div>
            );
          })}
        </div>

        <div className="search-direction">
          <input
            type="text"
            className="search-direction__input"
            placeholder="Введите название объекта (город, станция,трасса....)"
          />
          <div className="search-direction__button">
            <svg
              width={19}
              height={19}
              viewBox="0 0 19 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.9429 17.6343L12.7751 11.4664C13.7322 10.2291 14.2499 8.71621 14.2499 7.12497C14.2499 5.22023 13.5066 3.43424 12.1623 2.08762C10.8181 0.740997 9.02734 0 7.12497 0C5.2226 0 3.43186 0.743372 2.08762 2.08762C0.740997 3.43186 0 5.22023 0 7.12497C0 9.02734 0.743372 10.8181 2.08762 12.1623C3.43186 13.5089 5.22023 14.2499 7.12497 14.2499C8.71621 14.2499 10.2267 13.7322 11.4641 12.7774L17.6319 18.9429C17.65 18.961 17.6715 18.9754 17.6951 18.9852C17.7188 18.995 17.7441 19 17.7697 19C17.7953 19 17.8206 18.995 17.8442 18.9852C17.8679 18.9754 17.8893 18.961 17.9074 18.9429L18.9429 17.9098C18.961 17.8917 18.9754 17.8702 18.9852 17.8466C18.995 17.823 19 17.7976 19 17.772C19 17.7465 18.995 17.7211 18.9852 17.6975C18.9754 17.6739 18.961 17.6524 18.9429 17.6343ZM10.887 10.887C9.87996 11.8916 8.54521 12.4449 7.12497 12.4449C5.70473 12.4449 4.36998 11.8916 3.36299 10.887C2.35837 9.87996 1.80499 8.54521 1.80499 7.12497C1.80499 5.70473 2.35837 4.36761 3.36299 3.36299C4.36998 2.35837 5.70473 1.80499 7.12497 1.80499C8.54521 1.80499 9.88233 2.35599 10.887 3.36299C11.8916 4.36998 12.4449 5.70473 12.4449 7.12497C12.4449 8.54521 11.8916 9.88233 10.887 10.887Z"
                fill="white"
              />
            </svg>
          </div>
        </div>

        <div className="change-transport">
          <div
            className={`change-transport__item ${
              currentTransportType ? "change-transport__item_active" : ""
            }`}
            onClick={this.changeTypeTransport.bind(this, true)}
          >
            {currentTransportType ? (
              <img src={carW} alt="" />
            ) : (
              <img src={carB} alt="" />
            )}
            <span>Автомобильные дороги</span>
          </div>
          <div
            className={`change-transport__item ${
              !currentTransportType ? "change-transport__item_active" : ""
            }`}
            onClick={this.changeTypeTransport.bind(this, false)}
          >
            {!currentTransportType ? (
              <img src={trainW} alt="" />
            ) : (
              <img src={trainB} alt="" />
            )}
            <span>Ж/Д дороги</span>
          </div>
        </div>

        <div className="route-info">
          <svg
            width={33}
            height={33}
            viewBox="0 0 33 33"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="route-info__close"
            onClick={this.searchRoute}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M16.2305 17.8284L23.5463 25.1442L25.6676 23.0228L18.3518 15.707L25.1442 8.91466L23.0228 6.79334L16.2305 13.5857L9.43761 6.79286L7.31629 8.91418L14.1091 15.707L6.79286 23.0233L8.91418 25.1446L16.2305 17.8284Z"
              fill="url(#paint0_linear)"
            />
            <defs>
              <linearGradient
                id="paint0_linear"
                x1="8.11499"
                y1="24.3455"
                x2="24.345"
                y2="8.11548"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2A28B9" />
                <stop offset={1} stopColor="#1B1666" />
              </linearGradient>
            </defs>
          </svg>

          <div v="route-info__title">
            Маршрут:
            <span>Казань - Волгоград</span>
          </div>

          <div className="route-info__operator">
            Выбранный тип оператора: <span>Beeline</span>
          </div>

          <div className="route-info__road-type">
            Тип дороги:
            <span>Ж/Д дороги</span>
          </div>

          <div className="route-info__duration">
            Продолжительность в пути: <span>960 км (23 часа)</span>
          </div>

          <div className="route-info__connection-type">
            Сеть на участке:
            <div className="connection-type__item">
              <div className="connection-type__title">Сеть 4G</div>
              <div className="connection-type__indicator">
                <div className="connection-type__container G-4">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="connection-type__container-dist">
                  <span>0 km</span>
                  <span>960 km</span>
                </div>
              </div>
            </div>
            <div className="connection-type__item">
              <div className="connection-type__title">Сеть 3G</div>
              <div className="connection-type__indicator">
                <div className="connection-type__container G-3">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="connection-type__container-dist">
                  <span>0 km</span>
                  <span>960 km</span>
                </div>
              </div>
            </div>
            <div className="connection-type__item">
              <div className="connection-type__title">Сеть 2G</div>
              <div className="connection-type__indicator">
                <div className="connection-type__container G-2">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="connection-type__container-dist">
                  <span>0 km</span>
                  <span>960 km</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`search-route search-route_${
            openSearchRouteControls ? "active" : "disable"
          }`}
        >
          <div
            className="search-route__title"
            onClick={() =>
              this.setState({
                openSearchRouteControls: !this.state.openSearchRouteControls
              })
            }
          >
            <img
              src={arrow}
              alt=""
              srcset=""
              style={
                openSearchRouteControls
                  ? { transform: "rotate(0deg)", transitionDelay: "0.07s, 0s" }
                  : {
                      transform: "rotate(-180deg)",
                      transitionDelay: "0.07s, 0s"
                    }
              }
            />

            <span>Построить маршрут</span>
          </div>
          <div className="search-route-wrapper">
            <input
              className="search-route__first"
              placeholder="Место отправления"
              onInput={e =>
                this.setState({ firstInput: e.currentTarget.value })
              }
            />
            <input
              className="search-route__last"
              placeholder="Место прибытия"
              onInput={e =>
                this.setState({ secondInput: e.currentTarget.value })
              }
            />
            <div className="search-route__button" onClick={this.searchRoute}>
              Найти маршрут
            </div>
          </div>
        </div>

        <div className="mapUpdate" onClick={this.updateMap}>
          <img src={refresh} alt="" width="18" height="18" />
        </div>

        <div className="popup-review">
          <img
            src={popup}
            alt=""
            srcset=""
            onClick={this.openPopup.bind(this, false)}
          />
        </div>

        <div className="popup-button" onClick={this.openPopup.bind(this, true)}>
          <img src={question} alt="" />
        </div>
      </React.Fragment>
    );
  }
}
