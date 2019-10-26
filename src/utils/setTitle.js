const decorator = (title, Component) => class extends Component {
	componentDidMount(...params) {
		document.title = title;
		super.componentDidMount && super.componentDidMount(...params);
	}
}

const factory = (title) => {
	//if (arguments.length == 0) throw new Error('设置一个title！');
	return decorator.bind(null, title);
}

export default factory;
