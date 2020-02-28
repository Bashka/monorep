class TreeNode {
	/**
	 * @params {*} value
	 * @params {TreeNode[]} children
	 */
	constructor(value, children) {
		this.value = value;
		this.children = children;
	}

	/**
	 * @params {*} value
	 *
	 * @returns {TreeNode}
	 */
	static empty(value) {
		return new TreeNode(value, []);
	}

	/**
	 * @params {function(*, *|null): *} fn
	 * @params {*|null} parent
	 *
	 * @returns {TreeNode}
	 */
	reduce(fn, parent = null) {
		const value = fn(this.value, parent);

		return new TreeNode(
			value,
			this.children.reduce(
				(children, n) => [
					...children,
					n.reduce(fn, value)
				],
				[]
			)
		)
	}

	/**
	 * @params {function(*): *} fn
	 *
	 * @returns {*}
	 */
	map(fn) {
		return this.children.map(n => fn(n.value));
	}

	/**
	 * @params {function(*): *} fn
	 *
	 * @returns {*}
	 */
	flatMap(fn) {
		return this.children.flatMap(n => [
			fn(n.value),
			...n.flatMap(fn)
		]);
	}
}

module.exports = {
	trace  : id => {
		console.log(id);
		return id;
	},
	id     : v => v,
	prop   : name => obj => typeof obj[name] === 'function' ? obj[name]() : obj[name],
	compose: (...fns) => arg => fns.reduceRight((res, fn) => [fn.call(null, ...res)], [arg])[0],
	TreeNode
};
