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
        nij:
          'https://cdn.jsdelivr.net/gh/QiShaoXuan/live2DModel@1.0.0/live2d-widget-model-ni-j/assets/ni-j.model.json',
        nico:
          'https://cdn.jsdelivr.net/gh/QiShaoXuan/live2DModel@1.0.0/live2d-widget-model-nico/assets/nico.model.json',
        nietzsche:
          'https://cdn.jsdelivr.net/gh/QiShaoXuan/live2DModel@1.0.0/live2d-widget-model-nietzsche/assets/nietzsche.model.json',
        nipsilon:
          'https://cdn.jsdelivr.net/gh/QiShaoXuan/live2DModel@1.0.0/live2d-widget-model-nipsilon/assets/nipsilon.model.json',
        nito:
          'https://cdn.jsdelivr.net/gh/QiShaoXuan/live2DModel@1.0.0/live2d-widget-model-nito/assets/nito.model.json',
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
    const random = Math.floor(Math.random() * 5);
    const model = ['nij', 'nico', 'nietzsche', 'nipsilon', 'nito'];

    setTimeout(() => {
      window.loadlive2d('module', this.state.model[model[random]]);
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
        />
      </div>
    );
  }
}

export default Live2d;
