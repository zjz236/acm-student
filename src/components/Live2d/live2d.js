import './live2d.less';
import React from 'react';
import live2dJSString from './assets/live2d';
import { history } from 'umi';

class Live2d extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: true,
      model: {
        blackCat:
          'https://cdn.jsdelivr.net/gh/QiShaoXuan/live2DModel@1.0.0/live2d-widget-model-koharu/assets/koharu.model.json',
        whiteCat:
          'https://cdn.jsdelivr.net/gh/QiShaoXuan/live2DModel@1.0.0/live2d-widget-model-haruto/assets/haruto.model.json',
      },
      style: {
        width: 280,
        height: 250,
      },
    };
  }

  componentDidMount() {
    this.initCat();
    history.listen(val => {
      this.initCat();
    });
  }

  initCat = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
      ? true
      : false;
    if (isMobile) {
      this.setState({
        isLoaded: false,
      });
      return console.log('mobile do not load model');
    }

    if (!window.loadlive2d) {
      const script = document.createElement('script');
      script.innerHTML = live2dJSString;
      document.body.appendChild(script);
    }
    this.setState({
      style: {
        width: (150 / 1424) * document.body.clientWidth,
        height: ((150 / 1424) * document.body.clientWidth) / 0.8,
      },
    });

    setTimeout(() => {
      window.loadlive2d(
        'module',
        Math.random() > 0.5
          ? this.state.model.blackCat
          : this.state.model.whiteCat,
      );
    });
  };

  render() {
    const { style } = this.state;
    return (
      <div className="live-container">
        <canvas
          id="module"
          width={style.width}
          height={style.height}
          className="live2d"
        ></canvas>
      </div>
    );
  }
}

export default Live2d;
