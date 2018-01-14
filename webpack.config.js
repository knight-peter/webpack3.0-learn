// 引入路径
const path = require('path');

// 压缩js代码
const uglify = require('uglifyjs-webpack-plugin');
// 压缩html,'html-webpack-plugin'需要额外安装
const htmlPlugin = require('html-webpack-plugin');
// 抽离css样式
const extractTextPlugin = require("extract-text-webpack-plugin");
// node的glob模块允许你使用 *等符号, 来写一个glob规则,像在shell里一样,获取匹配对应规则的文件.
const glob = require('glob');
// 去掉无用css
const PurifyCSSPlugin = require("purifycss-webpack");
// 为了使用ProvidePlugin,引用webpack
const webpack = require("webpack");
// 集中拷贝静态资源
const copyWebpackPlugin = require("copy-webpack-plugin");


/* 引入webpack.config设置 */
const entry = require("./wepack_config/entery_webpack");

/* 生产环境和开发环境判断 */
console.log('当前开发环境：', encodeURIComponent(process.env.type));
if (process.env.type = 'build') {
  var website = {
    publicPath: 'http://localhost:1717/'
  }
} else {
  var website = {
    publicPath: 'http://jspang.com:1717/'
  }
}




module.exports = {
  /* 开发阶段，调试开发 大项目用'source-map'打包，小项目用'eval-source-map'打包*/
  devtool: 'eval-source-map',
  // 入口文件
  entry: entry.path,
  // 出口文件
  output: {
    path: path.resolve(__dirname, 'dist'),
    /* 打包后的名字和入口文件的名字一样 */
    filename: '[name].js',
    // 公共路径
    publicPath: website.publicPath
  },
  // 文件处理，css,img等
  module: {
    rules: [{
        test: /\.css$/,
        // 用extractTextPlugin抽离css,然后再调用'style-loader'，'css-loader'
        use: extractTextPlugin.extract({
          use: [{
              loader: 'css-loader',
              options: {
                importLoaders: 1
              }
            },
            'postcss-loader', //添加css3前缀
          ],
          fallback: 'style-loader'
        })
      },
      // css中图片引用处理
      {
        test: /\.(png|jpg|gif|svg)/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 5000, //图片大于5000使用路径，小于则用base64
            outputPath: 'images/' //配置图片路径
          }
        }]
      },
      // html中img的src处理
      {
        test: /\.(htm|html)$/i,
        use: ['html-withimg-loader']
      },
      // less
      {
        test: /\.less$/,
        use: extractTextPlugin.extract({
          use: [{
              loader: 'css-loader'
            }, {
              loader: 'less-loader'
            },
            'postcss-loader',
          ],
          fallback: 'style-loader'
        })
      },
      // scss 
      {
        test: /\.scss/,
        use: extractTextPlugin.extract({
          use: [{
              loader: 'css-loader'
            }, {
              loader: 'sass-loader'
            },
            'postcss-loader',
          ],
          fallback: 'style-loader'
        })

      },
      // js ES6转译
      {
        test: /\.(jsx|js)$/,
        use: {
          loader: 'babel-loader',
          // options配置写到'.babelrc'文件中，webpack.config.js中不写babel配置
          // 目前使用env来编译，放弃使用es2015。   env是最新版本。
          /* options:{
            presets:['env','react']
          } */
        },
        /* 添加例外文件夹，不用转译 */
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    /* js压缩 */
    // new uglify(),
    /* 优化，抽离第三方库 */
    new webpack.optimize.CommonsChunkPlugin({
      name:['jquery','vue'],
      filename:'assets/[name]/[name].js',
      minChunks:2
    }),
    /* 引入第三方库 */
    new webpack.ProvidePlugin({
      $: 'jquery',
      'vue': 'vue', //必须是已经安装好的第三方库可以引入
    }),
    /* html压缩 */
    new htmlPlugin({
      minify: {
        // 去掉属性值双引号
        removeAttributeQuotes: true
      },
      // 添加hash值，防止缓存
      hash: true,
      template: './src/index.html'
    }),
    // '/css/index.css'分离后生成的路径和文件名
    new extractTextPlugin('/css/index.css'),
    /* 删除多余css */
    new PurifyCSSPlugin({
      // 当获取到匹配的文件的时候执行回调.如果需要同步的获取文件列表 var files = glob.sync(pattern, [options])
      paths: glob.sync(path.join(__dirname, 'src/*.html'))
    }),
    /* 自动添加注释 */
    new webpack.BannerPlugin('徐子玉版权所有'),
    /* 集中拷贝静态资源 */
    new copyWebpackPlugin([{
      // __dirname是node语句，意思是‘本地目录’
      from:__dirname+'/src/public',
      to:'./public'
    }]),
    /* 热更新 */
    new webpack.HotModuleReplacementPlugin()
  ],
  // 开发环境服务
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    // 不推荐使用'localhost',在cmd中用'ipconfig'命令查询本机ip地址，填入IPv4 地址
    host: 'localhost',
    // 服务器压缩参数，默认配置为true
    compress: true,
    // 端口,可以使用任何你喜欢的数字
    port: 1717,
  },
  watchOptions: {
    poll: 1000, //监测修改的时间(ms)
    aggregateTimeout: 500, //防止重复按键，500毫米内算按键一次
    ignored: /node_modules/, //不监测
  }
}