<img src="https://pact.online/dist/img/dweb_whitebackground.png" width="200">

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> Your Gateway to the Distributed Web

[Dweb.page](https://dweb.page) (previously [Pact.online](http://www.pact.online)) is an open source webpage that lets you **share and search content on the distributed web** based on [IPFS](https://ipfs.io/). The webpage itself runs on any writable IPFS gateway (see Hosting below). It’s one of the first distributed websites, and it's completely running in your browser, meaning you are in control of your own data. Furthermore, the website uses the distributed ledger technology [IOTA](https://www.iota.org/) to store metadata of the publicly uploaded files. The decentralized search engine integrated into the website uses this metadata to index the uploaded content. Additionally, the transfer history based on IOTA provides a transparent logging system and allows you to claim the ownership of your data.

Click below to learn more about it in a short **[youtube video](https://www.youtube.com/watch?v=vVZP-mfy6QE&t)**:

<a href="https://www.youtube.com/watch?v=vVZP-mfy6QE&t"><img src="https://pact.online/dist/img/dwebyoutube.png" width="500px" alt="Dweb.page youtube"></a>

---

## Table of Contents

- [Security](#security)
- [Install](#install)
- [Usage](#usage)
- [Maintainer](#maintainer)
- [Contributing](#contributing)
  - [IPFS Node](#ipfs-node)
  - [Donate](#donate)
  - [Code](#code)
- [License](#license)

## Security
For a description of the security of [Dweb.page](https://dweb.page) see the first draft of the [security whitepaper](https://github.com/PACTCare/Pact.online/blob/master/Pact%20Secuirty%20Whitepaper_V0.11.pdf)
*(Outdated draft needs to be changed after new signature + search engine implementation)*.

## Install

This project uses [node](http://nodejs.org) and [npm](https://npmjs.com). Go check them out if you don't have them locally installed.
To create the index.html simply run:
```
npm run build
```

## Usage

[Dweb.page](https://dweb.page) simply needs to be hosted on a writable IPFS gateway. You can easily run [Dweb.page](https://dweb.page) local by following the below tutorial. We think that not every single application should start their own IPFS gateway due to performance reasons. Rather you have only one IPFS gateway running on your local machine or browser. Additionally the current setup is much faster and in theory also works for example on the Internet Explorer (currently not supported).

* [Tutorial local hosting](https://blog.florence.chat/tutorial-how-to-host-your-own-file-transfer-service-on-your-pc-22698c9d6362)
* [Tutorial online hosting](https://blog.florence.chat/tutorial-host-your-own-ipfs-node-and-help-the-next-generation-of-web-2860eb59e45e)

You can also use [Dweb.page](https://dweb.page) to host your own distributed web project ([see this tutorial](https://blog.florence.chat/tutorial-how-to-create-your-own-distributed-website-in-just-a-few-seconds-5100ccf068bc)).

## Maintainer

[David Hawig](https://github.com/Noc2)

## Contributing
You can either support this project by setting up an [IPFS Node](#ipfs-node), [donating](#donate) or by contributing to the [code](#code).

### IPFS Node
If you wish to participate you can simply [set up your own IPFS node with a writeable gateway](https://blog.florence.chat/tutorial-host-your-own-ipfs-node-and-help-the-next-generation-of-web-2860eb59e45e). You need to allow a maximum upload size on your server of 1GB. Lastly, reach out to us at info[at]pact[dot]care or on our [discord server](https://discord.gg/VMj7PFN) so we then can integrate your side on our main page. Currently, we share the IOTA donations equally among all participants at the end of every month. For transparency, you can track all donations under the current IOTA donation address. In the future, we might set up an advertising model to make it more attractive for IPFS nodes to participate.

The most recent online version of [Dweb.page](https://dweb.page) has the following hash:
```
QmaG6gCPHBKEvQtCTG7ELa1J1fh9K7iitcCwrWponxFydy
```
**List of participating nodes**
* https://pact.onl/ipfs/QmaG6gCPHBKEvQtCTG7ELa1J1fh9K7iitcCwrWponxFydy (by [Pact](https://pact.care/))

### Donate

IOTA Donation address
```
LRKZARMRXNBSUAOGYOMCRBAZAK9ZSVWTIXOVFTGTX9FRZVUNIM9NLBEZPPZIDD9MQHVCOFNELKGVCIYVWQGRWYZU9X
```

### Code
If you want to help either join our **[discord server](https://discord.gg/VMj7PFN)** or you can open issues for bugs you've found or features you think are missing. You can also submit pull requests to this repository.

If editing the README, please conform to the [standard-readme specification](https://github.com/RichardLitt/standard-readme).

## License
[GNU General Public License v3.0](https://github.com/PACTCare/Dweb.page/blob/master/LICENSE) © PACT Care B.V.
