import {React, Component} from "react";
import './Main.css';

class Main extends Component {

    state = {
        data: [],
        loading: false,
        text: '',
        compressionText: 'marvelcomics',
        compressedText: '',
        decompressionText: '',
        decompressedText: '',
        copied: false
    }

    submit = () => {
        if(this.state.text === ""){
            alert('Invalid Input');
            return;
        }
        
        this.setState({ loading: true });
        fetch('https://proedge-node.herokuapp.com/result/'+this.state.text)
        .then(res => res.json())
        .then((data) => {
            this.setState({ data: data });
            this.setState({ loading: false });
            this.setState({ text: '' });
        }).catch(()=>{
            alert("Error");
            this.setState({ loading: false });
        });
    }

    shorten = () => {
        var reg = /^[a-z]+$/;
        if (!reg.test(this.state.compressionText)) {
            alert("Invalid input!");
            return;
        } 
        var compressedInput = '';
        var bitString = '';
        for(let ch of this.state.compressionText){
            let code = (ch.charCodeAt()-96); //coded as -> a=1,b=2,c=3... 
            let bits = (code).toString(2);  //converted to bits -> a=1,b=10,c=11...
            let fiveDigitBits = ("000000" + bits).substr(-5); // coverted to five digit bits -> a=00001,b=00010...
            bitString += fiveDigitBits; // combined into single string
        }

        var n = 6; // number of bits used to create a single character of compressed string
        for(let ch=0;ch<bitString.length;ch+=n){
            let nDigitBits = bitString.substr(ch,n); // n bit characters
            if(nDigitBits.length!==n){
                // when ndigitbits is less than number of bits required, for example to convert 011 to 011000 (when n=6)
                let temp = parseInt(nDigitBits,2)<<n-nDigitBits.length;
                nDigitBits = ("0000000" + temp.toString(2)).substr(-6);
            }
            let code = parseInt(nDigitBits,2); // binary to decimal
            let char = String.fromCharCode((code+58).toString(10)); // decimal+58 to char to avoid invalid characters
            compressedInput += char; 
        }
        this.setState({ compressedText: compressedInput, copied: false });
    }

    expand = () => {
        var decompressedOutput = '';
        var bitString = '';

        for(let ch of this.state.decompressionText){
            let code = (ch.charCodeAt()-58); //decoded as decimal from character 
            let bits = (code).toString(2);  //converted to bits -> a=1,b=10,c=11...
            let fiveDigitBits = ("0000000" + bits).substr(-6); // coverted to six digit bits -> a=000001,b=000010...
            bitString += fiveDigitBits; // combined into single string
        }
        
        var n = 5; // number of bits used to create a single character of decompressed string
        for(let ch=0;ch<bitString.length;ch+=n){
            let nDigitBits = bitString.substr(ch,n); // n bit characters
            let code = parseInt(nDigitBits,2); // binary to decimal
            if(code===0)break; // last remaining zero bits are null i.e. not required
            let char = String.fromCharCode((code+96).toString(10)); // decimal+96 to recover original characters
            decompressedOutput += char;
        }
        this.setState({ decompressedText: decompressedOutput });
    }

    copy = () => {
        navigator.clipboard.writeText(this.state.compressedText);
        this.setState({ copied: true });
    }

    compressionTextChanged = (event) => {
        this.setState({ compressionText: event.target.value, compressedText:'' })
    }

    render(){       
        const { data, loading } = this.state;
        return (
            <div className="Main">
                <div className="assignment-section">
                    <h1>Assignment 1</h1>
                    <div>
                        <span>Enter comma seperated Roll Numbers:</span>
                        <input 
                            className="input" 
                            type="text" 
                            onChange={event => this.setState({ text: event.target.value }) } 
                            value={this.state.text}
                            />
                        { loading ? <div className="loader"></div> : <button onClick={this.submit}>Submit</button>}
                    </div>
                    
                    { data.length !==0 && 
                        <div>
                            <h2>Result:</h2>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Roll No.</th>
                                        <th>Result</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(a => <tr key={a.rollNo}><td>{a.rollNo}</td><td>{a.result}</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    }
                </div>

                <div className="assignment-section">
                    <h1>Assignment 2</h1>
                    <div className="row">
                        <div className="col">
                            <span>Enter string (a-z) to shorten:</span>
                            <input 
                                className="input" 
                                type="text" 
                                onChange={event => this.compressionTextChanged(event) } 
                                value={this.state.compressionText}
                                />
                            <button onClick={this.shorten}>Shorten</button>
                            { this.state.compressedText!=='' && 
                                <>
                                    <div className="data">
                                        <span>Compressed Data: {this.state.compressedText}</span>
                                        { this.state.copied ? <span>Copied!</span> : <button onClick={this.copy}>Copy</button> }
                                    </div>
                                    <p>Data Length: {this.state.compressionText.length}</p>
                                    <p>Compressed Data Length: {this.state.compressedText.length}</p>
                                </>
                            }
                        </div>
                        <div className="col">
                            <span>Enter string to expand back:</span>
                            <input 
                                className="input" 
                                type="text" 
                                onChange={event => this.setState({ decompressionText: event.target.value }) } 
                                value={this.state.decompressionText}
                                />
                            <button onClick={this.expand}>Expand</button>
                            { this.state.decompressedText!=='' && 
                                <>
                                    <div>
                                        <p>Decompressed Data: {this.state.decompressedText}</p>
                                    </div>
                                    <p>Decompressed Data Length: {this.state.decompressedText.length}</p>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Main;